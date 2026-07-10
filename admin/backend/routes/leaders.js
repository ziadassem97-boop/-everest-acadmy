import { v4 as uuidv4 } from "uuid";
import express from "express";
import { query, queryOne, execute } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const leaders = await query("SELECT * FROM leaders ORDER BY sort_order ASC, created_at DESC");
  res.json(leaders);
});

router.post("/", async (req, res) => {
  const { name, rank, avatar, icon } = req.body;
  if (!name || !rank) return res.status(400).json({ error: "Name and rank required" });
  const id = uuidv4();
  await execute("INSERT INTO leaders (id, name, rank, avatar, icon) VALUES (?, ?, ?, ?, ?)",
    [id, name, rank, avatar || null, icon || "🏆"]);
  const leader = await queryOne("SELECT * FROM leaders WHERE id = ?", [id]);
  res.json(leader);
});

router.put("/:id", async (req, res) => {
  const { name, rank, avatar, icon } = req.body;
  await execute("UPDATE leaders SET name = ?, rank = ?, avatar = ?, icon = ? WHERE id = ?",
    [name, rank, avatar || null, icon || "🏆", req.params.id]);
  const leader = await queryOne("SELECT * FROM leaders WHERE id = ?", [req.params.id]);
  res.json(leader);
});

router.delete("/:id", async (req, res) => {
  await execute("DELETE FROM leaders WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

export default router;
