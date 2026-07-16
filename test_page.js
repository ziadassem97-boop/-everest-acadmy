const BASE = "http://localhost:5000";
async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...opts.headers },
    ...opts,
  });
  return { status: res.status, body: await res.json() };
}

async function test() {
  // Register
  const ts = Date.now();
  const reg = await api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ full_name: "Test User", email: `page_${ts}@test.com`, password: "test123" })
  });
  const userId = reg.body.user.id;
  console.log("User:", userId);

  // Admin login
  const admin = await api("/api/admin-auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin1@everest.com", password: "admin123" })
  });
  const AH = { "x-user-id": admin.body.user.id, "x-session-token": admin.body.session_token };

  // Approve user
  await api(`/api/users/${userId}/upgrade-account`, { method: "POST", headers: AH });

  // User login
  const login = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: `page_${ts}@test.com`, password: "test123" })
  });
  console.log("Login:", login.status);
  const H = { "x-user-id": login.body.user.id, "x-session-token": login.body.session_token };

  // Test all endpoints the RankingsPage calls
  const endpoints = [
    ["POST", "/api/ranks/update", H],
    ["GET", `/api/ranks/progress/${userId}`, H],
    ["GET", "/api/ranks/leaderboard", H],
    ["GET", "/api/ranks", {}],
    ["GET", `/api/mlm/rank-progress/${userId}`, H],
    ["GET", `/api/mlm/weekly-history/${userId}`, H],
  ];

  for (const [method, path, headers] of endpoints) {
    const r = await api(path, { method, headers });
    const status = r.status;
    const ok = status >= 200 && status < 300;
    console.log(`${ok ? "✅" : "❌"} ${method} ${path} → ${status}`);
    if (!ok) console.log("   Error:", JSON.stringify(r.body).slice(0, 300));
    else {
      const bodyStr = JSON.stringify(r.body);
      console.log("   Response size:", bodyStr.length, "chars");
      if (bodyStr.length < 400) console.log("   Body:", bodyStr);
    }
  }
}

test().catch(e => console.error("FATAL:", e));
