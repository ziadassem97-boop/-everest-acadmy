import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import { initDb } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["http://localhost:4000","http://localhost:3000"],
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(join(__dirname, "uploads")));

// In production, serve built frontends
if (process.env.NODE_ENV === "production") {
  // Admin frontend at /admin
  const adminDist = join(__dirname, "../frontend/dist");
  if (fs.existsSync(adminDist)) {
    app.use("/admin", express.static(adminDist));
    app.get("/admin/*", (req, res) => { res.sendFile(join(adminDist, "index.html")); });
  }
  // User frontend at root (optional, for same-origin deployment)
  const userDist = join(__dirname, "../../user/dist");
  if (fs.existsSync(userDist)) {
    app.use(express.static(userDist));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/uploads") || req.path.startsWith("/admin")) return next();
      res.sendFile(join(userDist, "index.html"));
    });
  }
}

import sessionAuth from "./middleware/sessionAuth.js";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import coursesRoutes from "./routes/courses.js";
import walletsRoutes from "./routes/wallets.js";
import mlmRoutes from "./routes/mlm.js";
import ranksRoutes from "./routes/ranks.js";
import leadersRoutes from "./routes/leaders.js";
import notificationsRoutes from "./routes/notifications.js";
import dashboardRoutes from "./routes/dashboard.js";
import uploadRoutes from "./routes/upload.js";
import paymentGatewayRoutes from "./routes/payment_gateways.js";
import chatRoutes from "./routes/chat.js";

app.use("/api", sessionAuth);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/wallets", walletsRoutes);
app.use("/api/mlm", mlmRoutes);
app.use("/api/ranks", ranksRoutes);
app.use("/api/leaders", leadersRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payment-gateways", paymentGatewayRoutes);
app.use("/api/chat", chatRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// Initialize database then start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Everest Admin Backend running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize database:", err);
});
