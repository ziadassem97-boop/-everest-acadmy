import express from "express";
import { query, queryOne, execute } from "../db.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.get("/", async (req, res) => {
  const { authorId, status } = req.query;
  let sql = `
    SELECT c.*, u.full_name as author_name,
      (SELECT COUNT(*) FROM topics WHERE course_id = c.id) as topic_count,
      (SELECT COUNT(*) FROM lessons l JOIN topics t ON l.topic_id = t.id WHERE t.course_id = c.id) as lesson_count,
      (SELECT COUNT(*) FROM quizzes q JOIN topics t ON q.topic_id = t.id WHERE t.course_id = c.id) as quiz_count,
      (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrollment_count
    FROM courses c LEFT JOIN users u ON c.author_id = u.id
  `;
  const conditions = [];
  const params = [];
  if (authorId) { conditions.push("c.author_id = ?"); params.push(authorId); }
  if (status) { conditions.push("c.status = ?"); params.push(status); }
  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  sql += " ORDER BY c.created_at DESC";
  const courses = await query(sql, params);
  res.json(courses);
});

router.get("/my", async (req, res) => {
  const { userId, status, courseId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId query param required" });
  let sql = `
    SELECT e.*, c.title, c.title_ar, c.description, c.description_ar, c.featured_image, c.difficulty
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE e.user_id = ?
  `;
  const params = [userId];
  if (status) { sql += " AND e.status = ?"; params.push(status); }
  if (courseId) { sql += " AND e.course_id = ?"; params.push(courseId); }
  sql += " ORDER BY e.enrolled_at DESC";
  const enrollments = await query(sql, params);
  res.json(enrollments);
});

router.get("/attempts", async (req, res) => {
  const attempts = await query(`
    SELECT qa.*, q.title as quiz_title, c.title as course_name, u.full_name as student_name, u.email as student_email
    FROM quiz_attempts qa
    JOIN quizzes q ON qa.quiz_id = q.id
    JOIN topics t ON q.topic_id = t.id
    JOIN courses c ON t.course_id = c.id
    JOIN users u ON qa.user_id = u.id
    ORDER BY qa.created_at DESC
  `);
  res.json(attempts);
});

router.get("/enrollments/list", async (req, res) => {
  const { status } = req.query;
  let sql = `
    SELECT e.*, u.full_name as student_name, u.email as student_email, c.title as course_name, c.title_ar as course_name_ar
    FROM enrollments e
    JOIN users u ON e.user_id = u.id
    JOIN courses c ON e.course_id = c.id
  `;
  const params = [];
  if (status) { sql += " WHERE e.status = ?"; params.push(status); }
  sql += " ORDER BY e.enrolled_at DESC";
  const enrollments = await query(sql, params);
  res.json(enrollments);
});

// Get enrollments for a specific course (with student details)
router.get("/enrollments/list/:courseId", async (req, res) => {
  const enrollments = await query(`
    SELECT e.*, u.full_name as student_name, u.email as student_email, u.phone as student_phone, u.rank as student_rank
    FROM enrollments e
    JOIN users u ON e.user_id = u.id
    WHERE e.course_id = ?
    ORDER BY e.enrolled_at DESC
  `, [req.params.courseId]);
  res.json(enrollments);
});

// Delete an enrollment (remove student from course)
router.delete("/enrollments/:id", async (req, res) => {
  const enrollment = await queryOne("SELECT * FROM enrollments WHERE id = ?", [req.params.id]);
  if (!enrollment) return res.status(404).json({ error: "Enrollment not found" });
  await execute("DELETE FROM enrollments WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

// Update enrollment (modify status, expires_at, etc.)
router.put("/enrollments/:id", async (req, res) => {
  const { status, expires_at } = req.body;
  const enrollment = await queryOne("SELECT * FROM enrollments WHERE id = ?", [req.params.id]);
  if (!enrollment) return res.status(404).json({ error: "Enrollment not found" });
  const updates = [];
  const params = [];
  if (status !== undefined) { updates.push("status = ?"); params.push(status); }
  if (expires_at !== undefined) { updates.push("expires_at = ?"); params.push(expires_at); }
  if (updates.length) {
    params.push(req.params.id);
    await execute(`UPDATE enrollments SET ${updates.join(", ")} WHERE id = ?`, params);
  }
  const updated = await queryOne("SELECT * FROM enrollments WHERE id = ?", [req.params.id]);
  res.json(updated);
});

router.get("/:id", async (req, res) => {
  const course = await queryOne("SELECT * FROM courses WHERE id = ?", [req.params.id]);
  if (!course) return res.status(404).json({ error: "Course not found" });
  const topics = await query("SELECT * FROM topics WHERE course_id = ? ORDER BY sort_order", [req.params.id]);
  for (const topic of topics) {
    topic.lessons = await query("SELECT * FROM lessons WHERE topic_id = ? ORDER BY sort_order", [topic.id]);
    topic.quizzes = await query("SELECT * FROM quizzes WHERE topic_id = ? ORDER BY created_at", [topic.id]);
  }
  res.json({ ...course, topics });
});

router.post("/", async (req, res) => {
  try {
    const { title, description, title_ar, description_ar, category_ar, difficulty, is_public, price, is_free, category, tags, featured_image, intro_video, author_id, status } = req.body;
    const id = uuidv4();
    await execute(
      "INSERT INTO courses (id, title, description, title_ar, description_ar, category_ar, difficulty, is_public, price, is_free, category, tags, featured_image, intro_video, author_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, title, description, title_ar, description_ar, category_ar, difficulty || "beginner", is_public ?? 1, price || 0, is_free ?? 1, category, tags, featured_image, intro_video, author_id, status || "published"]
    );
    const course = await queryOne("SELECT * FROM courses WHERE id = ?", [id]);
    res.json(course);
  } catch (err) {
    console.error("Error creating course:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const { title, description, title_ar, description_ar, category_ar, difficulty, is_public, price, is_free, category, tags, featured_image, intro_video, status } = req.body;
  await execute(
    "UPDATE courses SET title=?, description=?, title_ar=?, description_ar=?, category_ar=?, difficulty=?, is_public=?, price=?, is_free=?, category=?, tags=?, featured_image=?, intro_video=?, status=?, updated_at=datetime('now','localtime') WHERE id=?",
    [title, description, title_ar, description_ar, category_ar, difficulty, is_public, price, is_free, category, tags, featured_image, intro_video, status, req.params.id]
  );
  const course = await queryOne("SELECT * FROM courses WHERE id = ?", [req.params.id]);
  res.json(course);
});

router.delete("/:id", async (req, res) => {
  await execute("DELETE FROM courses WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

router.post("/:id/purchase", async (req, res) => {
  try {
    const { userId, payment_method, payment_proof } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const course = await queryOne("SELECT * FROM courses WHERE id = ? AND status = 'published'", [req.params.id]);
    if (!course) return res.status(404).json({ error: "Course not found or not available" });

    const user = await queryOne("SELECT * FROM users WHERE id = ?", [userId]);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role === "registration") return res.status(403).json({ error: "Registration users cannot purchase courses. Please upgrade to Student account.", upgradeRequired: true });
    if (user.role !== "student") return res.status(403).json({ error: "Only student accounts can purchase courses" });

    const existing = await queryOne("SELECT id, status FROM enrollments WHERE user_id = ? AND course_id = ?", [userId, req.params.id]);
    if (existing && existing.status !== "rejected") return res.status(400).json({ error: "Already enrolled in this course" });

    const price = course.price || 0;
    const method = payment_method || "emoney";

    // Handle payment
    if (method === "emoney") {
      if (price > 0 && (user.e_money || 0) < price) return res.status(400).json({ error: "Insufficient E-Money balance" });
      if (price > 0) await execute("UPDATE users SET e_money = e_money - ? WHERE id = ?", [price, userId]);
    }

    const isFree = price === 0 || method === "vodafone" || method === "instapay" || method === "admin";
    const enrollmentId = uuidv4();
    const status = (method === "admin" || price === 0) ? "approved" : "pending";

    if (existing && existing.status === "rejected") {
      // Reuse the old enrollment row — update it to pending
      await execute("UPDATE enrollments SET status=?, payment_method=?, payment_proof=?, progress=0, enrolled_at=datetime('now','localtime') WHERE id=?",
        [status, method, payment_proof || null, existing.id]);
    } else {
      await execute("INSERT INTO enrollments (id, user_id, course_id, progress, status, payment_method, payment_proof) VALUES (?, ?, ?, 0, ?, ?, ?)",
        [enrollmentId, userId, req.params.id, status, method, payment_proof || null]);
    }

    // Create wallet transaction for emoney
    if (method === "emoney" && price > 0) {
      const tid = uuidv4();
      await execute("INSERT INTO wallet_transactions (id, user_id, amount, type, description, status) VALUES (?, ?, ?, 'debit', ?, 'pending')",
        [tid, userId, price, `Purchase: ${course.title_ar || course.title}`]);
    }

    const enrollment = await queryOne("SELECT * FROM enrollments WHERE id = ?", [enrollmentId]);
    res.json(enrollment);
  } catch (err) {
    console.error("Purchase error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/enrollments/admin-add", async (req, res) => {
  try {
    const { adminId, userEmail, courseId } = req.body;
    if (!adminId || !userEmail || !courseId) return res.status(400).json({ error: "adminId, userEmail, and courseId required" });

    const admin = await queryOne("SELECT role FROM users WHERE id = ?", [adminId]);
    if (!admin || admin.role !== "admin") return res.status(403).json({ error: "Admin only" });

    const user = await queryOne("SELECT id, full_name FROM users WHERE email = ?", [userEmail]);
    if (!user) return res.status(404).json({ error: "User not found with this email" });

    const course = await queryOne("SELECT id, title, title_ar FROM courses WHERE id = ?", [courseId]);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const existing = await queryOne("SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?", [user.id, courseId]);
    if (existing) return res.status(400).json({ error: "User already enrolled in this course" });

    const enrollmentId = uuidv4();
    await execute("INSERT INTO enrollments (id, user_id, course_id, progress, status, payment_method) VALUES (?, ?, ?, 0, 'approved', 'admin')",
      [enrollmentId, user.id, courseId]);

    await incrementTeamSales(user.id, enrollmentId);

    const enrollment = await queryOne("SELECT * FROM enrollments WHERE id = ?", [enrollmentId]);
    res.json(enrollment);
  } catch (err) {
    console.error("Admin add error:", err);
    res.status(500).json({ error: err.message });
  }
});

async function updateUserRankAndReward(userId) {
  const user = await queryOne("SELECT total_team_sales, rank FROM users WHERE id = ?", [userId]);
  if (!user) return;
  const allRanks = await query("SELECT * FROM ranks WHERE is_active = 1 ORDER BY min_direct DESC");
  let newRank = "Star";
  for (const r of allRanks) {
    if (user.total_team_sales >= r.min_direct) { newRank = r.name; break; }
  }
  if (newRank !== user.rank) {
    const rankData = allRanks.find(r => r.name === newRank);
    await execute("UPDATE users SET rank = ?, updated_at = datetime('now','localtime') WHERE id = ?", [newRank, userId]);
    if (rankData && rankData.weekly_bonus > 0) {
      await execute("UPDATE users SET e_money = e_money + ? WHERE id = ?", [rankData.weekly_bonus, userId]);
      const tid = uuidv4(); await execute("INSERT INTO wallet_transactions (id, user_id, amount, type, description, status) VALUES (?, ?, ?, 'credit', ?, 'completed')", [tid, userId, rankData.weekly_bonus, `🎉 Rank up bonus - ${newRank}`]);
    }
    const nid = uuidv4(); await execute("INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, 'success')", [nid, userId, "🎉 Rank Up!", `You reached ${newRank} rank! Bonus: ${rankData?.weekly_bonus || 0} EM`]);
  }
}

async function incrementTeamSales(userId, excludeEnrollmentId) {
  const count = await queryOne("SELECT COUNT(*) as c FROM enrollments WHERE user_id = ? AND status = 'approved' AND id != ?", [userId, excludeEnrollmentId]);
  if (count.c > 0) return; // Already counted
  const userRef = await queryOne("SELECT referred_by FROM users WHERE id = ?", [userId]);
  if (!userRef || !userRef.referred_by) return;
  let uplineId = userRef.referred_by;
  const visited = new Set();
  while (uplineId && !visited.has(uplineId)) {
    visited.add(uplineId);
    await execute("UPDATE users SET total_team_sales = total_team_sales + 1 WHERE id = ?", [uplineId]);
    await updateUserRankAndReward(uplineId);
    const upline = await queryOne("SELECT referred_by FROM users WHERE id = ?", [uplineId]);
    uplineId = upline?.referred_by;
  }
}

router.put("/enrollments/:id/approve", async (req, res) => {
  const enrollment = await queryOne("SELECT * FROM enrollments WHERE id = ?", [req.params.id]);
  if (!enrollment) return res.status(404).json({ error: "Enrollment not found" });
  const course = await queryOne("SELECT title_ar, title FROM courses WHERE id = ?", [enrollment.course_id]);
  await execute("UPDATE enrollments SET status = 'approved' WHERE id = ?", [req.params.id]);
  const pendingTx = await queryOne("SELECT id FROM wallet_transactions WHERE user_id = ? AND type = 'debit' AND status = 'pending' ORDER BY created_at DESC LIMIT 1", [enrollment.user_id]);
  if (pendingTx) await execute("UPDATE wallet_transactions SET status = 'completed' WHERE id = ?", [pendingTx.id]);
  const nid = uuidv4(); await execute("INSERT INTO notifications (id, user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, 'success', ?)", [nid, enrollment.user_id, "✅ تم الموافقة على الاشتراك", `تم تأكيد اشتراكك في ${course?.title_ar || course?.title || "الكورس"}`, enrollment.course_id]);
  await incrementTeamSales(enrollment.user_id, enrollment.id);
  res.json({ success: true, message: "Enrollment approved" });
});

router.put("/enrollments/:id/reject", async (req, res) => {
  const enrollment = await queryOne("SELECT * FROM enrollments WHERE id = ?", [req.params.id]);
  if (!enrollment) return res.status(404).json({ error: "Enrollment not found" });
  const course = await queryOne("SELECT price, title_ar, title FROM courses WHERE id = ?", [enrollment.course_id]);
  if (course && course.price > 0) {
    await execute("UPDATE users SET e_money = e_money + ? WHERE id = ?", [course.price, enrollment.user_id]);
  }
  await execute("UPDATE enrollments SET status = 'rejected' WHERE id = ?", [req.params.id]);
  const pendingTx = await queryOne("SELECT id FROM wallet_transactions WHERE user_id = ? AND type = 'debit' AND status = 'pending' ORDER BY created_at DESC LIMIT 1", [enrollment.user_id]);
  if (pendingTx) await execute("UPDATE wallet_transactions SET status = 'refunded' WHERE id = ?", [pendingTx.id]);
  const nid = uuidv4(); await execute("INSERT INTO notifications (id, user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, 'error', ?)", [nid, enrollment.user_id, "❌ تم رفض الاشتراك", `تم رفض اشتراكك في ${course?.title_ar || course?.title || "الكورس"} وتم استرداد المبلغ`, enrollment.course_id]);
  res.json({ success: true, message: "Enrollment rejected, E-Money refunded" });
});

router.post("/:id/topics", async (req, res) => {
  const { title, summary, title_ar, summary_ar } = req.body;
  const id = uuidv4();
  const maxSort = await queryOne("SELECT COALESCE(MAX(sort_order), -1) as m FROM topics WHERE course_id = ?", [req.params.id]);
  await execute("INSERT INTO topics (id, course_id, title, summary, title_ar, summary_ar, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, req.params.id, title, summary, title_ar, summary_ar, (maxSort?.m ?? -1) + 1]);
  const topic = await queryOne("SELECT * FROM topics WHERE id = ?", [id]);
  res.json(topic);
});

router.put("/topics/:topicId", async (req, res) => {
  const { title, summary, title_ar, summary_ar } = req.body;
  await execute("UPDATE topics SET title=?, summary=?, title_ar=?, summary_ar=? WHERE id=?", [title, summary, title_ar, summary_ar, req.params.topicId]);
  res.json({ success: true });
});

router.delete("/topics/:topicId", async (req, res) => {
  await execute("DELETE FROM topics WHERE id=?", [req.params.topicId]);
  res.json({ success: true });
});

router.put("/topics/:topicId/lessons/:lessonId", async (req, res) => {
  const { title, content, title_ar, content_ar, video_url, duration, is_free } = req.body;
  await execute("UPDATE lessons SET title=?, content=?, title_ar=?, content_ar=?, video_url=?, duration=?, is_free=? WHERE id=?",
    [title, content, title_ar, content_ar, video_url, duration, is_free ?? 0, req.params.lessonId]);
  res.json({ success: true });
});

router.delete("/topics/:topicId/lessons/:lessonId", async (req, res) => {
  await execute("DELETE FROM lessons WHERE id=?", [req.params.lessonId]);
  res.json({ success: true });
});

router.put("/topics/:topicId/quizzes/:quizId", async (req, res) => {
  const { title, questions, total_marks } = req.body;
  await execute("UPDATE quizzes SET title=?, questions=?, total_marks=? WHERE id=?",
    [title, JSON.stringify(questions || []), total_marks || 0, req.params.quizId]);
  res.json({ success: true });
});

router.delete("/topics/:topicId/quizzes/:quizId", async (req, res) => {
  await execute("DELETE FROM quizzes WHERE id=?", [req.params.quizId]);
  res.json({ success: true });
});

router.post("/topics/:topicId/lessons", async (req, res) => {
  const { title, content, title_ar, content_ar, video_url, duration, is_free } = req.body;
  const id = uuidv4();
  const maxSort = await queryOne("SELECT COALESCE(MAX(sort_order), -1) as m FROM lessons WHERE topic_id = ?", [req.params.topicId]);
  await execute("INSERT INTO lessons (id, topic_id, title, content, title_ar, content_ar, video_url, duration, is_free, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, req.params.topicId, title, content, title_ar, content_ar, video_url, duration, is_free ?? 0, (maxSort?.m ?? -1) + 1]);
  res.json({ id, success: true });
});

router.post("/topics/:topicId/quizzes", async (req, res) => {
  const { title, questions, total_marks } = req.body;
  const id = uuidv4();
  await execute("INSERT INTO quizzes (id, topic_id, title, questions, total_marks) VALUES (?, ?, ?, ?, ?)",
    [id, req.params.topicId, title, JSON.stringify(questions || []), total_marks || 0]);
  res.json({ id, success: true });
});

export default router;
