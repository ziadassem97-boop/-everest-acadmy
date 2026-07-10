import { initDb, execute } from "./db.js";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  await initDb();

  const courseId = uuidv4();
  execute(`INSERT INTO courses (id, title, description, title_ar, description_ar, difficulty, is_public, price, is_free, category, category_ar, tags, status, author_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)`, [
    courseId,
    "Trading from Zero to Pro",
    "Learn the basics of trading in financial markets, technical and fundamental analysis, and risk management.",
    "دورة التداول من الصفر للاحتراف",
    "تعلم أساسيات التداول في الأسواق المالية، التحليل الفني والأساسي، وإدارة المخاطر. الدورة مناسبة للمبتدئين حتى المحترفين.",
    "beginner", 1, 0, 1, "Trading", "تداول", "forex,stocks,crypto", "admin-001"
  ]);

  const topic1Id = uuidv4();
  execute(`INSERT INTO topics (id, course_id, title, summary, title_ar, summary_ar, sort_order) VALUES (?, ?, ?, ?, ?, ?, 0)`, [
    topic1Id, courseId,
    "Introduction to Financial Markets",
    "Definition of financial markets, their types, and how they work.",
    "مقدمة في الأسواق المالية",
    "تعريف بالأسواق المالية وأنواعها وكيفية عملها"
  ]);

  execute(`INSERT INTO lessons (id, topic_id, title, content, title_ar, content_ar, video_url, duration, is_free, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, [
    uuidv4(), topic1Id,
    "What are Financial Markets?",
    "A simple explanation of financial markets and their types: stock market, forex market, commodity market.",
    "ما هي الأسواق المالية؟",
    "شرح مبسط للأسواق المالية وأنواعها: سوق الأسهم، سوق العملات، سوق السلع.",
    "https://www.youtube.com/watch?v=example1", 15, 1
  ]);
  execute(`INSERT INTO lessons (id, topic_id, title, content, title_ar, content_ar, video_url, duration, is_free, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`, [
    uuidv4(), topic1Id,
    "Types of Financial Assets",
    "The difference between stocks, bonds, currencies, commodities, and derivatives.",
    "أنواع الأصول المالية",
    "الفرق بين الأسهم والسندات والعملات والسلع والمشتقات.",
    "https://www.youtube.com/watch?v=example2", 20, 0
  ]);

  execute(`INSERT INTO quizzes (id, topic_id, title, questions, total_marks) VALUES (?, ?, ?, ?, ?)`, [
    uuidv4(), topic1Id, "Basic Concepts Quiz",
    JSON.stringify([
      { question: "What is a financial market?", options: ["A place to buy/sell assets", "A bank", "A store"], answer: 0 },
      { question: "What does CFD stand for?", options: ["Contract for Difference", "Stock", "Currency"], answer: 0 }
    ]), 10
  ]);

  const topic2Id = uuidv4();
  execute(`INSERT INTO topics (id, course_id, title, summary, title_ar, summary_ar, sort_order) VALUES (?, ?, ?, ?, ?, ?, 1)`, [
    topic2Id, courseId,
    "Technical Analysis",
    "Learn to read charts and technical indicators.",
    "التحليل الفني",
    "تعلم قراءة الشارتات والمؤشرات الفنية"
  ]);

  execute(`INSERT INTO lessons (id, topic_id, title, content, title_ar, content_ar, video_url, duration, is_free, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, [
    uuidv4(), topic2Id,
    "Introduction to Technical Analysis",
    "What is technical analysis? Difference between technical and fundamental analysis.",
    "مقدمة في التحليل الفني",
    "ما هو التحليل الفني؟ الفرق بين التحليل الفني والأساسي.",
    "https://www.youtube.com/watch?v=example3", 25, 1
  ]);
  execute(`INSERT INTO lessons (id, topic_id, title, content, title_ar, content_ar, video_url, duration, is_free, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`, [
    uuidv4(), topic2Id,
    "Japanese Candlestick Patterns",
    "Famous candlestick patterns: Engulfing, Hammer, Morning Star.",
    "أنماط الشموع اليابانية",
    "شرح أشهر أنماط الشموع: الابتلاع، المطرقة، النجم الصاعد.",
    "https://www.youtube.com/watch?v=example4", 30, 0
  ]);
  execute(`INSERT INTO lessons (id, topic_id, title, content, title_ar, content_ar, video_url, duration, is_free, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 2)`, [
    uuidv4(), topic2Id,
    "Technical Indicators",
    "RSI, MACD, Moving Averages - how to read and use them.",
    "المؤشرات الفنية",
    "RSI, MACD, Moving Averages - كيف تقرأها وتستخدمها.",
    "https://www.youtube.com/watch?v=example5", 35, 0
  ]);

  const topic3Id = uuidv4();
  execute(`INSERT INTO topics (id, course_id, title, summary, title_ar, summary_ar, sort_order) VALUES (?, ?, ?, ?, ?, ?, 2)`, [
    topic3Id, courseId,
    "Risk Management",
    "How to protect your capital and manage risk wisely.",
    "إدارة المخاطر",
    "كيف تحمي رأس مالك وتدير المخاطر بذكاء"
  ]);

  execute(`INSERT INTO lessons (id, topic_id, title, content, title_ar, content_ar, video_url, duration, is_free, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, [
    uuidv4(), topic3Id,
    "Risk Management Rules",
    "The 1% rule, position sizing, Stop Loss and Take Profit.",
    "قواعد إدارة المخاطر",
    "قاعدة 1%، تحديد حجم الصفقة، Stop Loss و Take Profit.",
    "https://www.youtube.com/watch?v=example6", 20, 0
  ]);

  console.log(`✅ Demo course added successfully!
EN: Trading from Zero to Pro
AR: دورة التداول من الصفر للاحتراف
3 topics | 6 lessons | 1 quiz
`);
}

seed().catch(console.error);
