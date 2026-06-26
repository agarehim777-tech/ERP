import { spawn } from "node:child_process";
import { resolve } from "node:path";

const port = 8791;
const dbPath = resolve("work/erpaz-api-smoke.sqlite");
const password = "smoke-password-123";
const child = spawn(process.execPath, ["server/erp-server.mjs"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    ERP_API_PORT: String(port),
    ERP_DB_PATH: dbPath,
    ERP_BOOTSTRAP_PASSWORD: password,
    ERP_BOOTSTRAP_EMAIL: "admin@local",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let stderr = "";
child.stderr.on("data", (chunk) => {
  stderr += chunk;
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForStart() {
  await new Promise((resolveReady, reject) => {
    const timer = setTimeout(() => reject(new Error(stderr || "SQLite API did not start.")), 5000);
    child.stdout.on("data", () => {
      clearTimeout(timer);
      resolveReady();
    });
  });
}

try {
  await waitForStart();
  const health = await fetch(`http://127.0.0.1:${port}/api/health`).then((response) => response.json());
  assert(health.status === "ok" && health.provider === "SQLite", "Health endpoint did not report SQLite.");

  const login = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@local", password }),
  }).then((response) => response.json());
  assert(login.token && login.user?.role === "Super Admin", "Bootstrap login failed.");

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${login.token}` };
  const state = await fetch(`http://127.0.0.1:${port}/api/state`, { headers }).then((response) => response.json());
  state.state.products = [{ id: "PRD-SMOKE", name: "Smoke Product", sku: "SMOKE-001" }];
  state.state.auditLog = [{ id: "AUD-SMOKE", date: new Date().toISOString(), module: "API", action: "Smoke", detail: "State persistence", status: "Tamamlandı", role: "Super Admin" }];
  const writeResponse = await fetch(`http://127.0.0.1:${port}/api/state`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ state: state.state }),
  });
  assert(writeResponse.ok, "State persistence request failed.");

  const restored = await fetch(`http://127.0.0.1:${port}/api/state`, { headers }).then((response) => response.json());
  assert(restored.state.products?.[0]?.sku === "SMOKE-001", "Persisted state was not restored.");

  console.log(JSON.stringify({ health: health.status, authenticated: login.user.email, persistedProduct: restored.state.products[0].sku }));
} finally {
  child.kill();
}
