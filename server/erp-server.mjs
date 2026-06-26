import { createServer } from "node:http";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import pg from "pg";
import { initialState } from "../src/data.js";

const { Pool } = pg;

const port = Number(process.env.PORT || process.env.ERP_API_PORT || 8787);
const host = process.env.HOST || (process.env.PORT ? "0.0.0.0" : "127.0.0.1");
const dbPath = resolve(process.env.ERP_DB_PATH || "data/erpaz.sqlite");
const databaseUrl = String(process.env.DATABASE_URL || "").trim();
const allowedOrigins = String(process.env.ERP_CORS_ORIGIN || "http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const bootstrapPassword = process.env.ERP_BOOTSTRAP_PASSWORD || "";
const sessionHours = 12;

function now() {
  return new Date().toISOString();
}

function json(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  const [salt, stored] = String(storedHash || "").split(":");
  if (!salt || !stored) return false;
  const computed = scryptSync(password, salt, 64);
  const expected = Buffer.from(stored, "hex");
  return expected.length === computed.length && timingSafeEqual(expected, computed);
}

function userPayload(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status };
}

function normalizeJsonValue(value) {
  return typeof value === "string" ? JSON.parse(value) : value;
}

function createSqliteStore() {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);

  function exec(sql) {
    db.exec(sql);
  }

  return {
    provider: "SQLite",
    async init() {
      exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS app_state (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          json TEXT NOT NULL,
          version INTEGER NOT NULL DEFAULT 1,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'Aktiv',
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS sessions (
          token_hash TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS audit_events (
          id TEXT PRIMARY KEY,
          happened_at TEXT NOT NULL,
          module TEXT NOT NULL,
          action TEXT NOT NULL,
          detail TEXT NOT NULL,
          status TEXT NOT NULL,
          role TEXT NOT NULL
        );
      `);
    },
    async get(sql, params = []) {
      return db.prepare(sql).get(...params);
    },
    async all(sql, params = []) {
      return db.prepare(sql).all(...params);
    },
    async run(sql, params = []) {
      return db.prepare(sql).run(...params);
    },
    async transaction(callback) {
      db.exec("BEGIN IMMEDIATE");
      try {
        const result = await callback(this);
        db.exec("COMMIT");
        return result;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
  };
}

function createPostgresStore() {
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
  });

  function toPostgres(sql) {
    let index = 0;
    return sql.replace(/\?/g, () => `$${++index}`);
  }

  async function withClient(callback) {
    const client = await pool.connect();
    try {
      return await callback(client);
    } finally {
      client.release();
    }
  }

  return {
    provider: "Postgres",
    async init() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS app_state (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          json JSONB NOT NULL,
          version INTEGER NOT NULL DEFAULT 1,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'Aktiv',
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS sessions (
          token_hash TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS audit_events (
          id TEXT PRIMARY KEY,
          happened_at TEXT NOT NULL,
          module TEXT NOT NULL,
          action TEXT NOT NULL,
          detail TEXT NOT NULL,
          status TEXT NOT NULL,
          role TEXT NOT NULL
        );
      `);
    },
    async get(sql, params = []) {
      const result = await pool.query(toPostgres(sql), params);
      return result.rows[0] || null;
    },
    async all(sql, params = []) {
      const result = await pool.query(toPostgres(sql), params);
      return result.rows;
    },
    async run(sql, params = []) {
      return pool.query(toPostgres(sql), params);
    },
    async transaction(callback) {
      return withClient(async (client) => {
        await client.query("BEGIN");
        const trx = {
          get: async (sql, params = []) => {
            const result = await client.query(toPostgres(sql), params);
            return result.rows[0] || null;
          },
          all: async (sql, params = []) => {
            const result = await client.query(toPostgres(sql), params);
            return result.rows;
          },
          run: async (sql, params = []) => client.query(toPostgres(sql), params),
        };
        try {
          const result = await callback(trx);
          await client.query("COMMIT");
          return result;
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        }
      });
    },
  };
}

const store = databaseUrl ? createPostgresStore() : createSqliteStore();

async function bootstrapAdmin() {
  const existing = await store.get("SELECT id FROM users LIMIT 1");
  if (existing || !bootstrapPassword) return;
  await store.run(
    "INSERT INTO users (id, name, email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      "USR-ADMIN",
      process.env.ERP_BOOTSTRAP_NAME || "Administrator",
      process.env.ERP_BOOTSTRAP_EMAIL || "admin@local",
      hashPassword(bootstrapPassword),
      "Super Admin",
      "Aktiv",
      now(),
    ],
  );
}

async function getAuth(req) {
  const header = String(req.headers.authorization || "");
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const tokenHash = hashToken(token);
  const row = await store.get(
    `
      SELECT users.id, users.name, users.email, users.role, users.status, sessions.expires_at
      FROM sessions JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ?
    `,
    [tokenHash],
  );
  if (!row || row.status !== "Aktiv" || new Date(row.expires_at).getTime() <= Date.now()) {
    if (row) await store.run("DELETE FROM sessions WHERE token_hash = ?", [tokenHash]);
    return null;
  }
  return { token, user: userPayload(row) };
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) reject(new Error("Request size limit exceeded"));
    });
    req.on("end", () => {
      try {
        resolveBody(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON payload"));
      }
    });
    req.on("error", reject);
  });
}

function seedState() {
  const state = structuredClone(initialState);
  state.dbMeta = {
    provider: store.provider,
    runtime: "server",
    schemaVersion: 1,
    version: 1,
    lastWriteAt: now(),
  };
  return state;
}

async function getState() {
  const row = await store.get("SELECT json FROM app_state WHERE id = 1");
  return row ? normalizeJsonValue(row.json) : null;
}

async function saveState(state) {
  const savedAt = now();
  const safeState = {
    ...state,
    dbMeta: {
      ...(state.dbMeta || {}),
      provider: store.provider,
      runtime: "server",
      lastWriteAt: savedAt,
    },
  };

  await store.transaction(async (trx) => {
    await trx.run(
      `
        INSERT INTO app_state (id, json, version, updated_at) VALUES (1, ?, 1, ?)
        ON CONFLICT(id) DO UPDATE SET json = excluded.json, version = app_state.version + 1, updated_at = excluded.updated_at
      `,
      [JSON.stringify(safeState), savedAt],
    );
    for (const entry of safeState.auditLog || []) {
      if (!entry?.id) continue;
      await trx.run(
        `
          INSERT INTO audit_events (id, happened_at, module, action, detail, status, role)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO NOTHING
        `,
        [
          entry.id,
          entry.date || savedAt,
          entry.module || "Sistem",
          entry.action || "Yenilenme",
          entry.detail || "",
          entry.status || "Tamamlandi",
          entry.role || "System",
        ],
      );
    }
  });

  return safeState;
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  }
}

const server = createServer(async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
    if (req.method === "GET" && url.pathname === "/healthz") {
      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end("ok");
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/health") {
      const hasBootstrapUser = Boolean(await store.get("SELECT id FROM users LIMIT 1"));
      json(res, 200, { status: "ok", provider: store.provider, hasBootstrapUser });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      const body = await readBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const user = await store.get("SELECT * FROM users WHERE lower(email) = lower(?)", [email]);
      if (!user || user.status !== "Aktiv" || !verifyPassword(password, user.password_hash)) {
        json(res, 401, { error: "Email ve ya parol yanlisdir." });
        return;
      }
      const token = randomBytes(32).toString("base64url");
      const expiresAt = new Date(Date.now() + sessionHours * 60 * 60 * 1000).toISOString();
      await store.run(
        "INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
        [hashToken(token), user.id, expiresAt, now()],
      );
      json(res, 200, { token, expiresAt, user: userPayload(user) });
      return;
    }

    const auth = await getAuth(req);
    if (!auth) {
      json(res, 401, { error: "Sessiya teleb olunur." });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/logout") {
      await store.run("DELETE FROM sessions WHERE token_hash = ?", [hashToken(auth.token)]);
      json(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/session") {
      json(res, 200, { user: auth.user });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/state") {
      json(res, 200, { state: (await getState()) || seedState() });
      return;
    }

    if (req.method === "PUT" && url.pathname === "/api/state") {
      const body = await readBody(req);
      if (!body.state || typeof body.state !== "object" || Array.isArray(body.state)) {
        json(res, 400, { error: "State obyekt kimi gonderilmelidir." });
        return;
      }
      json(res, 200, { state: await saveState(body.state) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/users") {
      if (auth.user.role !== "Super Admin") {
        json(res, 403, { error: "Bu emeliyyat yalniz Super Admin ucundur." });
        return;
      }
      const body = await readBody(req);
      const name = String(body.name || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!name || !email || password.length < 8) {
        json(res, 400, { error: "Ad, email ve en azi 8 simvoldan ibaret parol teleb olunur." });
        return;
      }
      const user = {
        id: `USR-${Date.now()}`,
        name,
        email,
        role: String(body.role || "Satis Meneceri"),
        status: "Aktiv",
      };
      try {
        await store.run(
          "INSERT INTO users (id, name, email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [user.id, user.name, user.email, hashPassword(password), user.role, user.status, now()],
        );
      } catch {
        json(res, 409, { error: "Bu email artiq istifade olunur." });
        return;
      }
      json(res, 201, { user });
      return;
    }

    json(res, 404, { error: "Endpoint tapilmadi." });
  } catch (error) {
    json(res, 400, { error: error instanceof Error ? error.message : "Sorgu emal olunmadi." });
  }
});

await store.init();
await bootstrapAdmin();

server.listen(port, host, () => {
  console.log(`ERP API ${store.provider} server is listening on http://${host}:${port}`);
});
