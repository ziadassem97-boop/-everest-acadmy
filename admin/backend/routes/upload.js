import express from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } });

const router = express.Router();

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

router.post("/base64", async (req, res) => {
  try {
    const { filename, data } = req.body;
    if (!data || !filename) return res.status(400).json({ error: "Missing filename or data" });
    const matches = data.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return res.status(400).json({ error: "Invalid base64 format" });
    const ext = filename.split(".").pop() || "png";
    const fname = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(matches[2], "base64");
    fs.writeFileSync(join(uploadDir, fname), buffer);
    res.json({ url: `/uploads/${fname}`, filename: fname });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
export { upload };
