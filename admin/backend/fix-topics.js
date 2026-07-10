import { initDb, execute } from "./db.js";

async function fix() {
  await initDb();
  execute("UPDATE topics SET title_ar = 'مقدمة في التسويق الرقمي' WHERE title = 'Introduction to Digital Marketing'");
  execute("UPDATE topics SET title_ar = 'التسويق الرقمي' WHERE title = 'Digital Marketing'");
  console.log("Fixed topic titles");
}

fix().catch(console.error);
