import express from "express";
import { query, execute, queryOne } from "../db.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM proofs ORDER BY sort_order ASC, created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { image, caption, sort_order } = req.body;
    if (!image) return res.status(400).json({ error: "Image required" });
    const id = uuidv4();
    await execute("INSERT INTO proofs (id, image, caption, sort_order) VALUES (?, ?, ?, ?)",
      [id, image, caption || "", parseInt(sort_order) || 0]);
    const row = await queryOne("SELECT * FROM proofs WHERE id = ?", [id]);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { image, caption, sort_order } = req.body;
    if (image) {
      await execute("UPDATE proofs SET image = ?, caption = ?, sort_order = ? WHERE id = ?",
        [image, caption || "", parseInt(sort_order) || 0, req.params.id]);
    } else {
      await execute("UPDATE proofs SET caption = ?, sort_order = ? WHERE id = ?",
        [caption || "", parseInt(sort_order) || 0, req.params.id]);
    }
    const row = await queryOne("SELECT * FROM proofs WHERE id = ?", [req.params.id]);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await execute("DELETE FROM proofs WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
