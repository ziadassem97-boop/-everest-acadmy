import express from "express";
import { query, queryOne, execute } from "../db.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await queryOne("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  if (user.blocked) return res.status(403).json({ error: "تم حظر حسابك. يرجى التواصل مع الإدارة." });
  if (user.status === 'pending') return res.status(403).json({ error: "حسابك قيد المراجعة. يرجى الانتظار حتى يتم تفعيله من الإدارة." });

  // Single-device session: generate new token, invalidating any previous session
  const session_token = uuidv4() + "-" + Date.now();
  await execute("UPDATE users SET session_token = ? WHERE id = ?", [session_token, user.id]);
  user.session_token = session_token;
  res.json({ user, session_token });
});

router.post("/register", async (req, res) => {
  try {
    const { full_name, email, phone, address, password, referral_code } = req.body;
    const existing = await queryOne("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const id = uuidv4();
    const code = "EVR-" + id.slice(0, 6).toUpperCase();

    let referredBy = null;
    if (referral_code) {
      const refUser = await queryOne("SELECT id FROM users WHERE referral_code = ?", [referral_code]);
      if (refUser) referredBy = refUser.id;
    }

    await execute(
      "INSERT INTO users (id, full_name, email, phone, address, password, referral_code, referred_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')",
      [id, full_name, email, phone || null, address || null, password, code, referredBy]
    );

    // Populate closure table
    await execute("INSERT INTO user_closure (ancestor, descendant, depth) VALUES (?, ?, 0)", [id, id]);
    if (referredBy) {
      // Copy all ancestors of the sponsor, adding the new user as descendant
      const ancestors = await query(
        "SELECT ancestor, depth FROM user_closure WHERE descendant = ? AND ancestor != descendant",
        [referredBy]
      );
      for (const a of ancestors) {
        await execute("INSERT INTO user_closure (ancestor, descendant, depth) VALUES (?, ?, ?)",
          [a.ancestor, id, a.depth + 1]);
      }
      // Add direct sponsor relationship
      await execute("INSERT INTO user_closure (ancestor, descendant, depth) VALUES (?, ?, 1)",
        [referredBy, id]);

      // Commission distribution to all uplines (existing logic)
      let upline = referredBy;
      let level = 1;
      while (upline) {
        const comId = uuidv4();
        await execute("INSERT INTO commissions (id, from_user_id, to_user_id, level, amount) VALUES (?, ?, ?, ?, ?)",
          [comId, id, upline, level, 1000]);
        await execute("UPDATE users SET e_money = e_money + 1000 WHERE id = ?", [upline]);
        if (level === 1) {
          await execute("UPDATE users SET direct_count = direct_count + 1 WHERE id = ?", [upline]);
        }
        const nid = uuidv4(); await execute("INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, 'commission')", [nid, upline, "💰 عمولة جديدة", `ربحت 1000 E-Money كمكافأة عن تسجيل عضو جديد`]);
        upline = await queryOne("SELECT referred_by FROM users WHERE id = ?", [upline]);
        if (upline) upline = upline.referred_by;
        level++;
      }
    }

    const user = await queryOne("SELECT * FROM users WHERE id = ?", [id]);
    res.json({ user });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
