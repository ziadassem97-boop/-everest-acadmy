// Test commission logic end-to-end
const BACKEND = "https://steadfast-energy-production-a9d1.up.railway.app";

async function api(path, opts = {}) {
  const res = await fetch(`${BACKEND}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  return res.json();
}

async function test() {
  console.log("=== Commission E2E Test ===\n");

  // 1. Login as admin
  console.log("1. Logging in as admin...");
  const adminLogin = await api("/api/admin-auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin1@everest.com", password: "admin123" }),
  });
  if (!adminLogin.session_token) { console.log("FAIL: Admin login failed:", adminLogin); return; }
  const adminHeaders = { "x-user-id": adminLogin.user.id, "x-session-token": adminLogin.session_token };
  console.log("   OK: Admin logged in:", adminLogin.user.id);

  // 2. Register a new user WITH a referral code from Ziad
  // First, find Ziad's referral code
  console.log("\n2. Finding Ziad's referral code...");
  const users = await api("/api/users", { headers: adminHeaders });
  const ziad = users.find(u => u.full_name && u.full_name.includes("Ziad"));
  if (!ziad) { console.log("FAIL: Ziad not found"); return; }
  console.log("   Found Ziad:", ziad.id, ziad.referral_code, "e_money:", ziad.e_money);

  // 3. Register new user with Ziad's referral code
  console.log("\n3. Registering new user with Ziad's referral code...");
  const testEmail = `testcommission${Date.now()}@test.com`;
  const regResult = await api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      full_name: "Commission Test User",
      email: testEmail,
      phone: "01234567890",
      password: "test123",
      referral_code: ziad.referral_code,
    }),
  });
  if (!regResult.user) { console.log("FAIL: Registration failed:", regResult); return; }
  const newUserId = regResult.user.id;
  console.log("   Registered user:", newUserId, "referred_by:", regResult.user.referred_by);

  // 4. Check the user is pending
  const pendingUsers = await api("/api/users/pending-registrations", { headers: adminHeaders });
  const pendingUser = pendingUsers.find(u => u.id === newUserId);
  console.log("\n4. User pending:", !!pendingUser, "(referred_by:", pendingUser?.referred_by, ")");

  // 5. Approve as student
  console.log("\n5. Approving user as student...");
  const approveResult = await api(`/api/users/${newUserId}/approve-registration`, {
    method: "PUT",
    headers: adminHeaders,
    body: JSON.stringify({ account_type: "student" }),
  });
  console.log("   Approve result:", JSON.stringify(approveResult));

  // 6. Check Ziad's e_money after approval
  console.log("\n6. Checking Ziad's e_money after approval...");
  const ziadAfter = await api(`/api/users/${ziad.id}`, { headers: adminHeaders });
  console.log("   Ziad e_money BEFORE:", ziad.e_money, "AFTER:", ziadAfter.e_money);

  // 7. Check commission record
  const commissions = await api("/api/mlm/commissions", { headers: adminHeaders });
  const relevant = commissions.filter(c => c.to_user_id === ziad.id || c.from_user_id === newUserId);
  console.log("\n7. Commission records for Ziad:", JSON.stringify(relevant.slice(-3), null, 2));

  // 8. Summary
  const earned = ziadAfter.e_money - ziad.e_money;
  console.log("\n=== RESULT ===");
  console.log(`Ziad earned: ${earned} E-Money (expected: 1000)`);
  console.log(earned === 1000 ? "✅ PASS: Commission paid correctly!" : "❌ FAIL: Commission not paid correctly");
}

test().catch(e => console.error("Test error:", e));
