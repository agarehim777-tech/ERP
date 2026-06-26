import { createServer } from "node:http";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { initialState } from "../src/data.js";

const port = Number(process.env.ERP_API_PORT || 8787);
const dbPath = resolve(process.env.ERP_DB_PATH || "data/erpaz.sqlite");
const allowedOrigin = process.env.ERP_CORS_ORIGIN || "http://127.0.0.1:5174";
const bootstrapPassword = process.env.ERP_BOOTSTRAP_PASSWORD || "";
const sessionHours = 12;

mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`
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

function bootstrapAdmin() {
  const existing = db.prepare("SELECT id FROM users LIMIT 1").get();
  if (existing || !bootstrapPassword) return;
  db.prepare("INSERT INTO users (id, name, email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    "USR-ADMIN",
    process.env.ERP_BOOTSTRAP_NAME || "Administrator",
    process.env.ERP_BOOTSTRAP_EMAIL || "admin@local",
    hashPassword(bootstrapPassword),
    "Super Admin",
    "Aktiv",
    now(),
  );
}

bootstrapAdmin();

function getAuth(req) {
  const header = String(req.headers.authorization || "");
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const row = db.prepare(`
    SELECT users.id, users.name, users.email, users.role, users.status, sessions.expires_at
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ?
  `).get(hashToken(token));
  if (!row || row.status !== "Aktiv" || new Date(row.expires_at).getTime() <= Date.now()) {
    if (row) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
    return null;
  }
  return { token, user: userPayload(row) };
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) reject(new Error("Sorğu ölçüsü limiti keçdi"));
    });
    req.on("end", () => {
      try {
        resolveBody(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("JSON formatı yanlışdır"));
      }
    });
    req.on("error", reject);
  });
}

function seedState() {
  const state = structuredClone(initialState);
  state.dbMeta = {
    provider: "SQLite",
    runtime: "server",
    schemaVersion: 1,
    version: 1,
    lastWriteAt: now(),
  };
  return state;
}

function getState() {
  const row = db.prepare("SELECT json FROM app_state WHERE id = 1").get();
  return row ? JSON.parse(row.json) : null;
}

function saveState(state) {
  const savedAt = now();
  const safeState = {
    ...state,
    dbMeta: {
      ...(state.dbMeta || {}),
      provider: "SQLite",
      runtime: "server",
      lastWriteAt: savedAt,
    },
  };
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(`
      INSERT INTO app_state (id, json, version, updated_at) VALUES (1, ?, 1, ?)
      ON CONFLICT(id) DO UPDATE SET json = excluded.json, version = app_state.version + 1, updated_at = excluded.updated_at
    `).run(JSON.stringify(safeState), savedAt);
    const insertAudit = db.prepare(`
      INSERT OR IGNORE INTO audit_events (id, happened_at, module, action, detail, status, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const entry of safeState.auditLog || []) {
      if (!entry?.id) continue;
      insertAudit.run(
        entry.id,
        entry.date || savedAt,
        entry.module || "Sistem",
        entry.action || "Yenilənmə",
        entry.detail || "",
        entry.status || "Tamamlandı",
        entry.role || "System",
      );
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return safeState;
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && origin === allowedOrigin) {
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
    if (req.method === "GET" && url.pathname === "/api/health") {
      json(res, 200, { status: "ok", provider: "SQLite", hasBootstrapUser: Boolean(db.prepare("SELECT id FROM users LIMIT 1").get()) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      const body = await readBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const user = db.prepare("SELECT * FROM users WHERE lower(email) = lower(?)").get(email);
      if (!user || user.status !== "Aktiv" || !verifyPassword(password, user.password_hash)) {
        json(res, 401, { error: "Email və ya parol yanlışdır." });
        return;
      }
      const token = randomBytes(32).toString("base64url");
      const expiresAt = new Date(Date.now() + sessionHours * 60 * 60 * 1000).toISOString();
      db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)").run(hashToken(token), user.id, expiresAt, now());
      json(res, 200, { token, expiresAt, user: userPayload(user) });
      return;
    }

    const auth = getAuth(req);
    if (!auth) {
      json(res, 401, { error: "Sessiya tələb olunur." });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/logout") {
      db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(auth.token));
      json(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/session") {
      json(res, 200, { user: auth.user });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/state") {
      json(res, 200, { state: getState() || seedState() });
      return;
    }

    if (req.method === "PUT" && url.pathname === "/api/state") {
      const body = await readBody(req);
      if (!body.state || typeof body.state !== "object" || Array.isArray(body.state)) {
        json(res, 400, { error: "State obyekt kimi göndərilməlidir." });
        return;
      }
      json(res, 200, { state: saveState(body.state) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/users") {
      if (auth.user.role !== "Super Admin") {
        json(res, 403, { error: "Bu əməliyyat yalnız Super Admin üçündür." });
        return;
      }
      const body = await readBody(req);
      const name = String(body.name || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!name || !email || password.length < 8) {
        json(res, 400, { error: "Ad, email və ən azı 8 simvoldan ibarət parol tələb olunur." });
        return;
      }
      const user = {
        id: `USR-${Date.now()}`,
        name,
        email,
        role: String(body.role || "Satış Meneceri"),
        status: "Aktiv",
      };
      try {
        db.prepare("INSERT INTO users (id, name, email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
          user.id, user.name, user.email, hashPassword(password), user.role, user.status, now(),
        );
      } catch {
        json(res, 409, { error: "Bu email artıq istifadə olunur." });
        return;
      }
      json(res, 201, { user });
      return;
    }

    json(res, 404, { error: "Endpoint tapılmadı." });
  } catch (error) {
    json(res, 400, { error: error instanceof Error ? error.message : "Sorğu emal olunmadı." });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`ERP API SQLite server is listening on http://127.0.0.1:${port}`);
});
