import { v4 as uuidv4 } from "uuid";
import express from "express";
import { query, execute } from "../db.js";

const router = express.Router();

// Get notifications for a user
router.get("/", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId required" });
  const notifications = await query(`
    SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
  `, [userId]);
  const unreadResult = await query("SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0", [userId]);
  const unreadCount = unreadResult.length ? unreadResult[0].c : 0;
  res.json({ notifications, unreadCount });
});

// Mark one notification as read
router.put("/:id/read", async (req, res) => {
  await execute("UPDATE notifications SET is_read = 1 WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

// Mark all as read for a user
router.put("/read-all/:userId", async (req, res) => {
  await execute("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0", [req.params.userId]);
  res.json({ success: true });
});

export default router;
