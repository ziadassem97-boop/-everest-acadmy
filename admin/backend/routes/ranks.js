import { v4 as uuidv4 } from "uuid";
import express from "express";
import { query, queryOne, execute } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { all } = req.query;
  let sql = `
    SELECT r.*,
      (SELECT COUNT(*) FROM users u WHERE u.rank = r.name AND u.role != 'admin') as user_count
    FROM ranks r
  `;
  if (all === "true") sql += " ORDER BY r.sort_order";
  else sql += " WHERE r.is_active = 1 ORDER BY r.sort_order";
  const ranks = await query(sql);
  res.json(ranks);
});

router.post("/", async (req, res) => {
  try {
    const { name, min_direct, weekly_bonus, is_active } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });
    const id = uuidv4();
    const maxSort = await queryOne("SELECT COALESCE(MAX(sort_order), -1) as m FROM ranks");
    await execute("INSERT INTO ranks (id, name, min_direct, weekly_bonus, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)",
      [id, name, min_direct || 0, weekly_bonus || 0, (maxSort?.m ?? -1) + 1, is_active ?? 1]);
    const rank = await queryOne("SELECT * FROM ranks WHERE id = ?", [id]);
    res.json(rank);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, min_direct, weekly_bonus, sort_order, is_active } = req.body;
    const existing = await queryOne("SELECT id FROM ranks WHERE id = ?", [req.params.id]);
    if (!existing) return res.status(404).json({ error: "Rank not found" });
    const sets = []; const params = [];
    if (name !== undefined) { sets.push("name = ?"); params.push(name); }
    if (min_direct !== undefined) { sets.push("min_direct = ?"); params.push(min_direct); }
    if (weekly_bonus !== undefined) { sets.push("weekly_bonus = ?"); params.push(weekly_bonus); }
    if (sort_order !== undefined) { sets.push("sort_order = ?"); params.push(sort_order); }
    if (is_active !== undefined) { sets.push("is_active = ?"); params.push(is_active); }
    if (sets.length) {
      params.push(req.params.id);
      await execute("UPDATE ranks SET " + sets.join(", ") + " WHERE id = ?", params);
    }
    const rank = await queryOne("SELECT * FROM ranks WHERE id = ?", [req.params.id]);
    res.json(rank);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const existing = await queryOne("SELECT id FROM ranks WHERE id = ?", [req.params.id]);
    if (!existing) return res.status(404).json({ error: "Rank not found" });
    await execute("DELETE FROM ranks WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/update", async (req, res) => {
  const users = await query("SELECT id, total_team_sales FROM users WHERE role != 'admin'");
  const allRanks = await query("SELECT * FROM ranks WHERE is_active = 1 ORDER BY min_direct DESC");
  for (const user of users) {
    let newRank = "Star";
    for (const r of allRanks) {
      if (user.total_team_sales >= r.min_direct) { newRank = r.name; break; }
    }
    const current = await queryOne("SELECT rank FROM users WHERE id = ?", [user.id]);
    if (current && current.rank !== newRank) {
      await execute("UPDATE users SET rank = ?, updated_at = datetime('now','localtime') WHERE id = ?", [newRank, user.id]);
      const rankData = allRanks.find(r => r.name === newRank);
      if (rankData && rankData.weekly_bonus > 0) {
        await execute("UPDATE users SET e_money = e_money + ? WHERE id = ?", [rankData.weekly_bonus, user.id]);
        const tid = uuidv4(); await execute("INSERT INTO wallet_transactions (id, user_id, amount, type, description, status) VALUES (?, ?, ?, 'credit', ?, 'completed')", [tid, user.id, rankData.weekly_bonus, `🎉 Rank up bonus - ${newRank}`]);
      }
      const nid = uuidv4(); await execute("INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, 'success')", [nid, user.id, "🎉 Rank Up!", `You reached ${newRank} rank! Bonus: ${rankData?.weekly_bonus || 0} EM`]);
    }
  }
  res.json({ success: true });
});

// Bulk rank bonus distribution (one-time, for manual admin use)
router.post("/weekly-bonus", async (req, res) => {
  const users = await query("SELECT id, rank, total_team_sales FROM users WHERE role != 'admin'");
  const allRanks = await query("SELECT * FROM ranks WHERE is_active = 1 ORDER BY min_direct DESC");
  let totalDistributed = 0;
  let count = 0;
  for (const user of users) {
    let newRank = "Star";
    for (const r of allRanks) {
      if (user.total_team_sales >= r.min_direct) { newRank = r.name; break; }
    }
    if (newRank !== user.rank) {
      await execute("UPDATE users SET rank = ?, updated_at = datetime('now','localtime') WHERE id = ?", [newRank, user.id]);
      const rankData = allRanks.find(r => r.name === newRank);
      if (rankData && rankData.weekly_bonus > 0) {
        await execute("UPDATE users SET e_money = e_money + ? WHERE id = ?", [rankData.weekly_bonus, user.id]);
        const txId = uuidv4(); await execute("INSERT INTO wallet_transactions (id, user_id, amount, type, description, status) VALUES (?, ?, ?, 'credit', ?, 'completed')", [txId, user.id, rankData.weekly_bonus, `🎉 Rank up bonus - ${newRank}`]);
        totalDistributed += rankData.weekly_bonus;
        count++;
      }
      const nid = uuidv4(); await execute("INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, 'success')", [nid, user.id, "🎉 Rank Up!", `You reached ${newRank} rank! Bonus: ${rankData?.weekly_bonus || 0} EM`]);
    }
  }
  res.json({ success: true, totalDistributed, count });
});

// Get weekly bonus info for a user
router.get("/weekly-bonus/:userId", async (req, res) => {
  const user = await queryOne("SELECT rank FROM users WHERE id = ?", [req.params.userId]);
  if (!user) return res.status(404).json({ error: "User not found" });
  const rankRow = await queryOne("SELECT weekly_bonus FROM ranks WHERE name = ?", [user.rank]);
  res.json({ rank: user.rank, weeklyBonus: rankRow?.weekly_bonus || 0 });
});

export default router;
