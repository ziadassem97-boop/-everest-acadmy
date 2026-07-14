// Test multiple commission referrals
const BACKEND = "https://steadfast-energy-production-a9d1.up.railway.app";

async function api(path, opts = {}) {
  const res = await fetch(`${BACKEND}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  return res.json();
}

async function test() {
  console.log("=== Multi-Commission Test ===\n");

  const adminLogin = await api("/api/admin-auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin1@everest.com", password: "admin123" }),
  });
  const adminHeaders = { "x-user-id": adminLogin.user.id, "x-session-token": adminLogin.session_token };

  const users = await api("/api/users", { headers: adminHeaders });
  const ziad = users.find(u => u.full_name && u.full_name.includes("Ziad"));
  console.log("Ziad e_money BEFORE:", ziad.e_money);

  // Register 2 more users with Ziad's code
  for (let i = 1; i <= 2; i++) {
    const email = `multitest${i}${Date.now()}@test.com`;
    console.log(`\n--- User ${i} ---`);
    const reg = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name: `Multi Test ${i}`, email, password: "test123", referral_code: ziad.referral_code }),
    });
    if (!reg.user) { console.log("FAIL register:", reg); continue; }
    console.log(`Registered: ${reg.user.id}, referred_by: ${reg.user.referred_by}`);

    const approve = await api(`/api/users/${reg.user.id}/approve-registration`, {
      method: "PUT", headers: adminHeaders,
      body: JSON.stringify({ account_type: "student" }),
    });
    console.log(`Approved:`, approve.success);
  }

  const ziadAfter = await api(`/api/users/${ziad.id}`, { headers: adminHeaders });
  console.log("\n=== RESULT ===");
  console.log(`Ziad e_money BEFORE: ${ziad.e_money} | AFTER: ${ziadAfter.e_money}`);
  console.log(`Expected: ${ziad.e_money + 2000} | Got: ${ziadAfter.e_money}`);
  console.log(ziadAfter.e_money >= ziad.e_money + 2000 ? "✅ PASS" : "❌ FAIL");
}

test().catch(e => console.error("Error:", e));
