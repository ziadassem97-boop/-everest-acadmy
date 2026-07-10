import express from "express";
import { query, queryOne, execute } from "../db.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.get("/", async (req, res) => {
  const gateways = await query("SELECT * FROM payment_gateways ORDER BY created_at DESC");
  res.json(gateways);
});

router.get("/active", async (req, res) => {
  const gateways = await query("SELECT * FROM payment_gateways WHERE is_active = 1 ORDER BY created_at DESC");
  res.json(gateways);
});

router.post("/", async (req, res) => {
  try {
    const { type, value, label } = req.body;
    if (!type || !value) return res.status(400).json({ error: "type and value required" });
    const id = uuidv4();
    await execute("INSERT INTO payment_gateways (id, type, value, label) VALUES (?, ?, ?, ?)",
      [id, type, value, label || null]);
    const gateway = await queryOne("SELECT * FROM payment_gateways WHERE id = ?", [id]);
    res.json(gateway);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const { type, value, label, is_active } = req.body;
    const updates = []; const params = [];
    if (type !== undefined) { updates.push("type = ?"); params.push(type); }
    if (value !== undefined) { updates.push("value = ?"); params.push(value); }
    if (label !== undefined) { updates.push("label = ?"); params.push(label); }
    if (is_active !== undefined) { updates.push("is_active = ?"); params.push(is_active); }
    if (updates.length) {
      params.push(req.params.id);
      await execute(`UPDATE payment_gateways SET ${updates.join(", ")} WHERE id = ?`, params);
    }
    const gateway = await queryOne("SELECT * FROM payment_gateways WHERE id = ?", [req.params.id]);
    res.json(gateway);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", async (req, res) => {
  await execute("DELETE FROM payment_gateways WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

export default router;
