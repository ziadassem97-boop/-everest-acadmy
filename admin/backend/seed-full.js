import { initDb, execute } from "./db.js";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  await initDb();

  const courses = [
    {
      title: "Forex Trading Mastery",
      description: "Complete forex trading course from beginner to advanced.",
      title_ar: "دورة التداول من الصفر للاحتراف",
      description_ar: "تعلم أساسيات التداول في الأسواق المالية، التحليل الفني والأساسي، وإدارة المخاطر.",
      category: "trading", category_ar: "التداول والاستثمار",
      tags: "forex,stocks,crypto", is_free: 1, price: 0, difficulty: "beginner",
      topics: [
        { title: "Introduction to Markets", title_ar: "مقدمة في الأسواق المالية", summary_ar: "تعريف بالأسواق المالية وأنواعها", lessons: [
          { title: "What are Financial Markets?", title_ar: "ما هي الأسواق المالية؟", content_ar: "شرح مبسط للأسواق المالية", video_url: "https://www.youtube.com/watch?v=example1", duration: 15, is_free: 1 },
          { title: "Types of Assets", title_ar: "أنواع الأصول", content_ar: "الفرق بين الأسهم والعملات", video_url: "https://www.youtube.com/watch?v=example2", duration: 20, is_free: 0 },
        ]},
        { title: "Technical Analysis", title_ar: "التحليل الفني", summary_ar: "تعلم قراءة الشارتات", lessons: [
          { title: "Candlesticks", title_ar: "الشموع اليابانية", content_ar: "أنماط الشموع", video_url: "https://www.youtube.com/watch?v=example3", duration: 25, is_free: 1 },
          { title: "Indicators", title_ar: "المؤشرات الفنية", content_ar: "RSI, MACD", video_url: "https://www.youtube.com/watch?v=example4", duration: 30, is_free: 0 },
        ]},
      ]
    },
    {
      title: "Digital Marketing Pro",
      description: "Master Facebook Ads, Google Ads, SEO, and content marketing.",
      title_ar: "التسويق الرقمي الاحترافي",
      description_ar: "إتقان إعلانات فيسبوك وجوجل وتحسين محركات البحث والتسويق بالمحتوى.",
      category: "marketing", category_ar: "التسويق والمبيعات",
      tags: "facebook ads,google ads,seo,marketing", is_free: 0, price: 500, difficulty: "intermediate",
      topics: [
        { title: "Marketing Fundamentals", title_ar: "أساسيات التسويق", summary_ar: "مبادئ التسويق الرقمي", lessons: [
          { title: "What is Digital Marketing?", title_ar: "ما هو التسويق الرقمي؟", content_ar: "مقدمة في التسويق الرقمي", video_url: "https://www.youtube.com/watch?v=example5", duration: 18, is_free: 1 },
        ]},
      ]
    },
    {
      title: "Full-Stack Web Development",
      description: "Learn HTML, CSS, JavaScript, React, and Node.js to build modern web apps.",
      title_ar: "تطوير الويب الشامل",
      description_ar: "تعلم HTML, CSS, JavaScript, React, Node.js لبناء تطبيقات ويب حديثة.",
      category: "dev", category_ar: "تطوير البرمجيات",
      tags: "html,css,javascript,react,nodejs", is_free: 1, price: 0, difficulty: "beginner",
      topics: [
        { title: "HTML & CSS Basics", title_ar: "أساسيات HTML و CSS", summary_ar: "تعلم بناء الصفحات", lessons: [
          { title: "HTML Structure", title_ar: "هيكل HTML", content_ar: "العناصر والوسوم", video_url: "https://www.youtube.com/watch?v=example6", duration: 20, is_free: 1 },
        ]},
      ]
    },
    {
      title: "Artificial Intelligence Fundamentals",
      description: "Understand AI, machine learning, and deep learning concepts.",
      title_ar: "أساسيات الذكاء الاصطناعي",
      description_ar: "فهم مفاهيم الذكاء الاصطناعي والتعلم الآلي والتعلم العميق.",
      category: "ai", category_ar: "الذكاء الاصطناعي",
      tags: "ai,machine learning,deep learning", is_free: 1, price: 0, difficulty: "beginner",
      topics: [
        { title: "AI Introduction", title_ar: "مقدمة في الذكاء الاصطناعي", summary_ar: "ما هو الذكاء الاصطناعي", lessons: [
          { title: "What is AI?", title_ar: "ما هو الذكاء الاصطناعي؟", content_ar: "تاريخ وتطور الذكاء الاصطناعي", video_url: "https://www.youtube.com/watch?v=example7", duration: 22, is_free: 1 },
        ]},
      ]
    },
    {
      title: "Freelancing & Business Launch",
      description: "Start your freelancing career or launch your own online business.",
      title_ar: "العمل الحر وإطلاق المشاريع",
      description_ar: "ابدأ مسيرتك في العمل الحر أو أطلق مشروعك الخاص أونلاين.",
      category: "freelance", category_ar: "العمل الحر الرقمي",
      tags: "freelancing,business,entrepreneurship", is_free: 0, price: 299, difficulty: "beginner",
      topics: [
        { title: "Getting Started", title_ar: "البداية", summary_ar: "كيف تبدأ في العمل الحر", lessons: [
          { title: "Platforms Overview", title_ar: "نظرة على المنصات", content_ar: "منصات العمل الحر", video_url: "https://www.youtube.com/watch?v=example8", duration: 15, is_free: 1 },
        ]},
      ]
    },
  ];

  for (const c of courses) {
    const courseId = uuidv4();
    execute(`INSERT INTO courses (id, title, description, title_ar, description_ar, difficulty, is_public, price, is_free, category, category_ar, tags, status, author_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)`,
      [courseId, c.title, c.description, c.title_ar, c.description_ar, c.difficulty, 1, c.price, c.is_free, c.category, c.category_ar, c.tags, "admin-001"]);

    for (let ti = 0; ti < c.topics.length; ti++) {
      const t = c.topics[ti];
      const topicId = uuidv4();
      execute(`INSERT INTO topics (id, course_id, title, summary, title_ar, summary_ar, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [topicId, courseId, t.title, t.summary || "", t.title_ar, t.summary_ar || "", ti]);

      for (let li = 0; li < t.lessons.length; li++) {
        const l = t.lessons[li];
        execute(`INSERT INTO lessons (id, topic_id, title, content, title_ar, content_ar, video_url, duration, is_free, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), topicId, l.title, l.content || "", l.title_ar, l.content_ar, l.video_url, l.duration, l.is_free, li]);
      }

      // Add a quiz per topic
      execute(`INSERT INTO quizzes (id, topic_id, title, questions, total_marks) VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), topicId, `Quiz: ${t.title}`, JSON.stringify([
          { question: "Sample question?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 0 }
        ]), 10]);
    }
  }

  console.log(`✅ Seeded ${courses.length} courses with topics, lessons, and quizzes.`);
}

seed().catch(console.error);
