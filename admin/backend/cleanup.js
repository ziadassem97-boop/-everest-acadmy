import { initDb, query, execute } from "./db.js";

async function cleanup() {
  await initDb();

  // Find my seeded courses (no featured_image, not the admin's original course)
  const myCourses = query("SELECT id, title, title_ar FROM courses WHERE (featured_image IS NULL OR featured_image = '') AND id != '8d7cf383-52bd-4ac5-b6e5-0b557bc4ceec'");
  console.log("My seeded courses to delete:", myCourses.length);
  
  for (const c of myCourses) {
    execute("DELETE FROM quizzes WHERE topic_id IN (SELECT id FROM topics WHERE course_id = ?)", [c.id]);
    execute("DELETE FROM lessons WHERE topic_id IN (SELECT id FROM topics WHERE course_id = ?)", [c.id]);
    execute("DELETE FROM topics WHERE course_id = ?", [c.id]);
    execute("DELETE FROM enrollments WHERE course_id = ?", [c.id]);
    execute("DELETE FROM courses WHERE id = ?", [c.id]);
    console.log("Deleted:", c.title || c.title_ar);
  }

  // Update admin's course to published
  execute("UPDATE courses SET status = 'published', category = 'marketing', category_ar = 'التسويق والمبيعات', is_public = 1 WHERE id = '8d7cf383-52bd-4ac5-b6e5-0b557bc4ceec'");
  console.log("Admin course updated to published");

  // Remove orphaned enrollments
  const remaining = query("SELECT e.id, c.title_ar FROM enrollments e JOIN courses c ON e.course_id = c.id");
  console.log("Remaining enrollments:", remaining.length);
  remaining.forEach(e => console.log("  -", e.title_ar));

  console.log("Done");
}

cleanup().catch(console.error);
