import express from "express";
import { query, queryOne, execute } from "../db.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.get("/", async (req, res) => {
  const users = await query("SELECT id, full_name, email, phone, address, role, referral_code, rank, e_money, academic_points, total_team_sales, direct_count, qualified_direct_count, negative_allowed, blocked, status, created_at FROM users ORDER BY created_at DESC");
  res.json(users);
});

// Pending registration approvals (must be before /:id)
router.get("/pending-registrations", async (req, res) => {
  const users = await query("SELECT id, full_name, email, phone, role, referral_code, created_at FROM users WHERE status = 'pending' ORDER BY created_at DESC");
  res.json(users);
});

router.get("/:id", async (req, res) => {
  const user = await queryOne("SELECT * FROM users WHERE id = ?", [req.params.id]);
  if (!user) return res.status(404).json({ error: "User not found" });
  const team = await query("SELECT id, full_name, email, role, rank, e_money, created_at FROM users WHERE referred_by = ? ORDER BY created_at DESC", [req.params.id]);
  res.json({ ...user, team });
});

router.put("/:id", async (req, res) => {
  const { full_name, email, phone, address, role, bio, avatar } = req.body;
  await execute("UPDATE users SET full_name=?, email=?, phone=?, address=?, role=?, bio=?, avatar=?, updated_at=datetime('now','localtime') WHERE id=?",
    [full_name, email, phone, address, role, bio, avatar, req.params.id]);
  const user = await queryOne("SELECT * FROM users WHERE id = ?", [req.params.id]);
  res.json(user);
});

router.put("/:id/role", async (req, res) => {
  const { role } = req.body;
  await execute("UPDATE users SET role=?, updated_at=datetime('now','localtime') WHERE id=?", [role, req.params.id]);
  res.json({ success: true });
});

router.put("/:id/e-money", async (req, res) => {
  const { amount, allow_negative } = req.body;
  const user = await queryOne("SELECT * FROM users WHERE id = ?", [req.params.id]);
  if (!user) return res.status(404).json({ error: "User not found" });

  const newBalance = (user.e_money || 0) + amount;
  if (newBalance < 0 && !user.negative_allowed && !allow_negative)
    return res.status(400).json({ error: `Cannot go negative. Current balance: ${user.e_money}. Enable negative balance first.` });

  await execute("UPDATE users SET e_money = e_money + ?, updated_at=datetime('now','localtime') WHERE id=?", [amount, req.params.id]);
  const tid = uuidv4();
  const type = amount >= 0 ? "credit" : "debit";
  await execute("INSERT INTO wallet_transactions (id, user_id, amount, type, description, status) VALUES (?, ?, ?, ?, ?, 'completed')",
    [tid, req.params.id, Math.abs(amount), type, "Manual adjustment by admin"]);
  const updated = await queryOne("SELECT id, full_name, email, e_money, negative_allowed FROM users WHERE id = ?", [req.params.id]);
  res.json(updated);
});

// Toggle negative balance permission
router.put("/:id/negative-toggle", async (req, res) => {
  const user = await queryOne("SELECT id, negative_allowed FROM users WHERE id = ?", [req.params.id]);
  if (!user) return res.status(404).json({ error: "User not found" });
  const newVal = user.negative_allowed ? 0 : 1;
  await execute("UPDATE users SET negative_allowed = ?, updated_at=datetime('now','localtime') WHERE id=?", [newVal, req.params.id]);
  res.json({ success: true, negative_allowed: !!newVal });
});

router.get("/filter/:role", async (req, res) => {
  const role = req.params.role === "all" ? "%" : req.params.role;
  const users = await query("SELECT id, full_name, email, role, rank, e_money, blocked, created_at FROM users WHERE role LIKE ? ORDER BY created_at DESC", [role]);
  res.json(users);
});

router.put("/:id/block", async (req, res) => {
  await execute("UPDATE users SET blocked = 1, updated_at = datetime('now','localtime') WHERE id = ?", [req.params.id]);
  res.json({ success: true, blocked: true });
});

router.put("/:id/unblock", async (req, res) => {
  await execute("UPDATE users SET blocked = 0, updated_at = datetime('now','localtime') WHERE id = ?", [req.params.id]);
  res.json({ success: true, blocked: false });
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await queryOne("SELECT id FROM users WHERE id = ?", [req.params.id]);
    if (!user) return res.status(404).json({ error: "User not found" });
    // Delete related records first to avoid FK issues
    await execute("DELETE FROM enrollments WHERE user_id = ?", [req.params.id]);
    await execute("DELETE FROM commissions WHERE from_user_id = ? OR to_user_id = ?", [req.params.id, req.params.id]);
    await execute("DELETE FROM wallet_transactions WHERE user_id = ?", [req.params.id]);
    await execute("DELETE FROM notifications WHERE user_id = ?", [req.params.id]);
    await execute("DELETE FROM quiz_attempts WHERE user_id = ?", [req.params.id]);
    await execute("DELETE FROM upgrade_requests WHERE user_id = ?", [req.params.id]);
    await execute("DELETE FROM top_up_requests WHERE user_id = ?", [req.params.id]);
    await execute("DELETE FROM feedbacks WHERE user_id = ?", [req.params.id]);
    await execute("UPDATE users SET referred_by = NULL WHERE referred_by = ?", [req.params.id]);
    await execute("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/approve-registration", async (req, res) => {
  try {
    const user = await queryOne("SELECT id, full_name, email, status FROM users WHERE id = ?", [req.params.id]);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.status !== 'pending') return res.status(400).json({ error: "User is not pending" });
    await execute("UPDATE users SET status = 'active', updated_at = datetime('now','localtime') WHERE id = ?", [req.params.id]);
    const nid = uuidv4(); await execute("INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, 'success')", [nid, req.params.id, "✅ تم تفعيل الحساب", "تم تفعيل حسابك! يمكنك الآن تسجيل الدخول"]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id/reject-registration", async (req, res) => {
  try {
    const user = await queryOne("SELECT id, full_name, email FROM users WHERE id = ?", [req.params.id]);
    if (!user) return res.status(404).json({ error: "User not found" });
    await execute("UPDATE users SET status = 'rejected', updated_at = datetime('now','localtime') WHERE id = ?", [req.params.id]);
    const nid = uuidv4(); await execute("INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, 'error')", [nid, req.params.id, "❌ تم رفض الحساب", "نأسف، تم رفض طلب تسجيل حسابك"]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Upgrade requests
router.post("/upgrade-request", async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") return res.status(400).json({ error: "Invalid request body" });
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const user = await queryOne("SELECT * FROM users WHERE id = ?", [userId]);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== "registration") return res.status(400).json({ error: "Only registration accounts can request upgrade" });
    const existing = await queryOne("SELECT id FROM upgrade_requests WHERE user_id = ? AND status = 'pending'", [userId]);
    if (existing) return res.status(400).json({ error: "لديك طلب ترقية معلق بالفعل" });
    const id = uuidv4();
    await execute("INSERT INTO upgrade_requests (id, user_id, status) VALUES (?, ?, 'pending')", [id, userId]);
    res.json({ success: true, id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/upgrade-requests/list", async (req, res) => {
  const requests = await query(`
    SELECT r.*, u.full_name, u.email, u.phone, u.created_at as user_since
    FROM upgrade_requests r
    JOIN users u ON r.user_id = u.id
    ORDER BY r.created_at DESC
  `);
  res.json(requests);
});

router.put("/upgrade-requests/:id/approve", async (req, res) => {
  try {
    const req2 = await queryOne("SELECT * FROM upgrade_requests WHERE id = ?", [req.params.id]);
    if (!req2) return res.status(404).json({ error: "Request not found" });
    await execute("UPDATE upgrade_requests SET status = 'approved', reviewed_at = datetime('now','localtime') WHERE id = ?", [req.params.id]);
    await execute("UPDATE users SET role = 'student', updated_at = datetime('now','localtime') WHERE id = ?", [req2.user_id]);
    const nid = uuidv4(); await execute("INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, 'success')", [nid, req2.user_id, "🎓 تم ترقية الحساب", "تم ترقية حسابك إلى Student Account! يمكنك الآن شراء الكورسات"]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/upgrade-requests/:id/reject", async (req, res) => {
  try {
    const req2 = await queryOne("SELECT * FROM upgrade_requests WHERE id = ?", [req.params.id]);
    if (!req2) return res.status(404).json({ error: "Request not found" });
    await execute("UPDATE upgrade_requests SET status = 'rejected', reviewed_at = datetime('now','localtime') WHERE id = ?", [req.params.id]);
    const nid = uuidv4(); await execute("INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, 'error')", [nid, req2.user_id, "❌ تم رفض طلب الترقية", "نأسف، تم رفض طلب ترقية حسابك"]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
