import express from "express";
import { query, queryOne, execute } from "../db.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.get("/topups", async (req, res) => {
  const { status } = req.query;
  let sql = `
    SELECT tr.*, u.full_name, u.email, u.phone as user_phone
    FROM top_up_requests tr
    JOIN users u ON tr.user_id = u.id
  `;
  const params = [];
  if (status) { sql += " WHERE tr.status = ?"; params.push(status); }
  sql += " ORDER BY tr.created_at DESC";
  res.json(await query(sql, params));
});

router.post("/topups", async (req, res) => {
  try {
    const { user_id, amount, payment_method, payment_proof, phone_number } = req.body;
    if (!user_id || !amount) return res.status(400).json({ error: "user_id and amount required" });
    const id = uuidv4();
    await execute("INSERT INTO top_up_requests (id, user_id, amount, payment_method, payment_proof, phone_number) VALUES (?, ?, ?, ?, ?, ?)",
      [id, user_id, amount, payment_method || "vodafone", payment_proof || null, phone_number || null]);
    res.json({ id, success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/topups/:id/approve", async (req, res) => {
  try {
    const request = await queryOne("SELECT * FROM top_up_requests WHERE id = ?", [req.params.id]);
    if (!request) return res.status(404).json({ error: "Request not found" });
    await execute("UPDATE top_up_requests SET status = 'approved' WHERE id = ?", [req.params.id]);
    await execute("UPDATE users SET e_money = e_money + ? WHERE id = ?", [request.amount, request.user_id]);
    const tid = uuidv4();
    await execute("INSERT INTO wallet_transactions (id, user_id, amount, type, description, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, 'completed')",
      [tid, request.user_id, request.amount, "credit", "Top-up approved", request.payment_method]);
    const nid = uuidv4(); await execute("INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, 'success')", [nid, request.user_id, "💰 تم شحن المحفظة", `تم إضافة ${request.amount} E-Money إلى محفظتك`]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/topups/:id/reject", async (req, res) => {
  try {
    const request = await queryOne("SELECT * FROM top_up_requests WHERE id = ?", [req.params.id]);
    if (!request) return res.status(404).json({ error: "Request not found" });
    await execute("UPDATE top_up_requests SET status = 'rejected' WHERE id = ?", [req.params.id]);
    const nid = uuidv4(); await execute("INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, 'error')", [nid, request.user_id, "❌ تم رفض الشحن", `تم رفض طلب شحن ${request.amount} E-Money`]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/transactions", async (req, res) => {
  const transactions = await query(`
    SELECT wt.*, u.full_name as user_name, u.email as user_email
    FROM wallet_transactions wt
    JOIN users u ON wt.user_id = u.id
    ORDER BY wt.created_at DESC
  `);
  res.json(transactions);
});

export default router;
