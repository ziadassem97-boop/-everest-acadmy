import express from "express";
import { query, execute, queryOne } from "../db.js";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM proofs ORDER BY sort_order ASC, created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Image required" });
    const id = uuidv4();
    const ext = (req.file.originalname.split(".").pop() || "png").toLowerCase();
    const fname = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = path.join(uploadsDir, fname);
    fs.writeFileSync(filePath, req.file.buffer);
    const imagePath = "/uploads/" + fname;
    const caption = req.body.caption || "";
    const sortOrder = parseInt(req.body.sort_order) || 0;
    await execute("INSERT INTO proofs (id, image, caption, sort_order) VALUES (?, ?, ?, ?)",
      [id, imagePath, caption, sortOrder]);
    const row = await queryOne("SELECT * FROM proofs WHERE id = ?", [id]);
    res.json(row);
  } catch (err) {
    console.error("proofs upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    if (req.file) {
      const ext = (req.file.originalname.split(".").pop() || "png").toLowerCase();
      const fname = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = path.join(uploadsDir, fname);
      fs.writeFileSync(filePath, req.file.buffer);
      const imagePath = "/uploads/" + fname;
      await execute("UPDATE proofs SET image = ?, caption = ?, sort_order = ? WHERE id = ?",
        [imagePath, req.body.caption || "", parseInt(req.body.sort_order) || 0, req.params.id]);
    } else {
      await execute("UPDATE proofs SET caption = ?, sort_order = ? WHERE id = ?",
        [req.body.caption || "", parseInt(req.body.sort_order) || 0, req.params.id]);
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
