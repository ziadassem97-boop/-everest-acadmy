import React, { useState } from "react";
import { useLang } from "../LangContext";

const api = async (path, opts = {}) => {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export default function CourseBuilderPage() {
  const { lang } = useLang();
  const t = (ar, en) => lang === "ar" ? ar : en;
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [inputLang, setInputLang] = useState("ar");

  const [course, setCourse] = useState({
    title: "", description: "",
    title_ar: "", description_ar: "", category_ar: "",
    difficulty: "beginner", is_public: true, price: 0, is_free: true,
    category: "", tags: "", featured_image: "", intro_video: "", author_id: "admin-001",
    status: "published",
  });

  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState({ title: "", summary: "", title_ar: "", summary_ar: "" });

  const handleChange = (field, value) => setCourse((prev) => ({ ...prev, [field]: value }));

  const saveCourse = async () => {
    if (!course.title.trim() && !course.title_ar.trim())
      return alert(t("الرجاء إدخال عنوان الكورس", "Please enter a course title"));
    setSaving(true);
    try {
      const saved = await api("/api/courses", { method: "POST", body: JSON.stringify(course) });
      const courseId = saved.id;

      for (const topic of topics) {
        const savedTopic = await api(`/api/courses/${courseId}/topics`, {
          method: "POST",
          body: JSON.stringify({ title: topic.title, summary: topic.summary, title_ar: topic.title_ar, summary_ar: topic.summary_ar }),
        });
        const topicId = savedTopic.id;

        for (const lesson of topic.lessons) {
          await api(`/api/topics/${topicId}/lessons`, {
            method: "POST",
            body: JSON.stringify({
              title: lesson.title, content: lesson.content || "",
              title_ar: lesson.title_ar, content_ar: lesson.content_ar || "",
              video_url: lesson.video_url || "", duration: lesson.duration || 0, is_free: lesson.is_free || false,
            }),
          });
        }

        for (const quiz of topic.quizzes) {
          await api(`/api/topics/${topicId}/quizzes`, {
            method: "POST",
            body: JSON.stringify({ title: quiz.title }),
          });
        }
      }

      alert(t("تم حفظ الكورس بنجاح! (" + topics.length + " مواضيع)", "Course saved successfully! (" + topics.length + " topics)"));
      setCourse({
        title: "", description: "", title_ar: "", description_ar: "", category_ar: "",
        difficulty: "beginner", is_public: true, price: 0, is_free: true,
        category: "", tags: "", featured_image: "", intro_video: "", author_id: "admin-001",
        status: "published",
      });
      setTopics([]);
    } catch (err) {
      alert(t("خطأ في حفظ الكورس: ", "Error saving course: ") + err.message);
    }
    setSaving(false);
  };

  const addTopic = () => {
    if (!newTopic.title && !newTopic.title_ar) return;
    setTopics((prev) => [...prev, { ...newTopic, id: Date.now().toString(), lessons: [], quizzes: [] }]);
    setNewTopic({ title: "", summary: "", title_ar: "", summary_ar: "" });
  };

  const addLesson = (topicId) => {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? {
              ...t,
              lessons: [
                ...t.lessons,
                { id: Date.now().toString(), title: "", title_ar: "", content: "", content_ar: "", video_url: "", is_free: false, duration: 0 },
              ],
            }
          : t
      )
    );
  };

  const updateTopic = (topicId, field, value) => {
    setTopics((prev) => prev.map((t) => (t.id === topicId ? { ...t, [field]: value } : t)));
  };

  const updateLesson = (topicId, lessonId, field, value) => {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? { ...t, lessons: t.lessons.map((l) => (l.id === lessonId ? { ...l, [field]: value } : l)) }
          : t
      )
    );
  };

  const addQuiz = (topicId) => {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? { ...t, quizzes: [...t.quizzes, { id: Date.now().toString(), title: "اختبار جديد", title_en: "New Quiz" }] }
          : t
      )
    );
  };

  const LangSwitch = () => (
    <div className="flex gap-1 mb-3">
      <button type="button" onClick={() => setInputLang("ar")}
        className={`px-3 py-1 text-xs rounded font-medium ${inputLang === "ar" ? "bg-everest-600 text-white" : "bg-gray-100 text-gray-500"}`}>العربية</button>
      <button type="button" onClick={() => setInputLang("en")}
        className={`px-3 py-1 text-xs rounded font-medium ${inputLang === "en" ? "bg-everest-600 text-white" : "bg-gray-100 text-gray-500"}`}>English</button>
    </div>
  );

  const settingsTabs = [
    { id: "general", ar: "عام", en: "General" },
    { id: "content-drip", ar: "جدولة المحتوى", en: "Content Drip" },
    { id: "enrollment", ar: "التسجيل", en: "Enrollment" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t("بناء الكورس", "Course Builder")}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <LangSwitch />

            {inputLang === "ar" ? (
              <>
                <label className="block text-sm font-medium mb-1">عنوان الكورس</label>
                <input type="text" value={course.title_ar} onChange={(e) => handleChange("title_ar", e.target.value)} placeholder="أدخل عنوان الكورس بالعربية" className="w-full px-4 py-2 border rounded-lg mb-4" />
                <label className="block text-sm font-medium mb-1">الوصف (عربي)</label>
                <textarea value={course.description_ar} onChange={(e) => handleChange("description_ar", e.target.value)} className="w-full p-4 min-h-[150px] border rounded-lg resize-y mb-4" placeholder="اكتب وصف الكورس بالعربية..." />
              </>
            ) : (
              <>
                <label className="block text-sm font-medium mb-1">Course Title</label>
                <input type="text" value={course.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="Enter course title in English" className="w-full px-4 py-2 border rounded-lg mb-4" />
                <label className="block text-sm font-medium mb-1">Description (English)</label>
                <textarea value={course.description} onChange={(e) => handleChange("description", e.target.value)} className="w-full p-4 min-h-[150px] border rounded-lg resize-y mb-4" placeholder="Write course description in English..." />
              </>
            )}

            <div className="flex gap-2 mb-4">
              {settingsTabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm rounded-lg font-medium ${activeTab === tab.id ? "bg-everest-600 text-white" : "bg-gray-100 text-gray-600"}`}
                >{lang === "ar" ? tab.ar : tab.en}</button>
              ))}
            </div>

            {activeTab === "general" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t("مستوى الصعوبة", "Difficulty")}</label>
                  <select value={course.difficulty} onChange={(e) => handleChange("difficulty", e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                    <option value="beginner">{t("مبتدئ", "Beginner")}</option>
                    <option value="intermediate">{t("متوسط", "Intermediate")}</option>
                    <option value="advanced">{t("متقدم", "Advanced")}</option>
                  </select>
                </div>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={course.is_public} onChange={(e) => handleChange("is_public", e.target.checked)} className="w-5 h-5" />
                  <span className="text-sm font-medium">{t("كورس عام", "Public Course")}</span>
                </label>
              </div>
            )}
            {activeTab === "content-drip" && <p className="text-gray-400 text-sm">{t("سيتم إضافة جدولة المحتوى قريباً", "Content drip coming soon")}</p>}
            {activeTab === "enrollment" && <p className="text-gray-400 text-sm">{t("سيتم إضافة إعدادات التسجيل قريباً", "Enrollment settings coming soon")}</p>}
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-bold mb-4">{t("المنهج الدراسي", "Curriculum")}</h3>

            {topics.map((topic) => (
              <div key={topic.id} className="border rounded-lg p-4 mb-3 bg-gray-50/50">
                <LangSwitch />
                {inputLang === "ar" ? (
                  <>
                    <input type="text" value={topic.title_ar} onChange={(e) => updateTopic(topic.id, "title_ar", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg mb-2 font-medium" placeholder="عنوان الموضوع بالعربية" />
                    <textarea value={topic.summary_ar} onChange={(e) => updateTopic(topic.id, "summary_ar", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg mb-3 text-sm" placeholder="ملخص الموضوع بالعربية" rows={2} />
                  </>
                ) : (
                  <>
                    <input type="text" value={topic.title} onChange={(e) => updateTopic(topic.id, "title", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg mb-2 font-medium" placeholder="Topic title in English" />
                    <textarea value={topic.summary} onChange={(e) => updateTopic(topic.id, "summary", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg mb-3 text-sm" placeholder="Topic summary in English" rows={2} />
                  </>
                )}

                {topic.lessons.length > 0 && (
                  <div className="mt-2 mb-3 space-y-2">
                    {topic.lessons.map((lesson) => (
                      <div key={lesson.id} className="bg-white rounded-lg border p-3">
                        {inputLang === "ar" ? (
                          <div className="space-y-2 mb-2">
                            <input type="text" value={lesson.title_ar} onChange={(e) => updateLesson(topic.id, lesson.id, "title_ar", e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm" placeholder="عنوان الدرس بالعربية" />
                            <textarea value={lesson.content_ar} onChange={(e) => updateLesson(topic.id, lesson.id, "content_ar", e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm" placeholder="محتوى الدرس بالعربية" rows={2} />
                          </div>
                        ) : (
                          <div className="space-y-2 mb-2">
                            <input type="text" value={lesson.title} onChange={(e) => updateLesson(topic.id, lesson.id, "title", e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm" placeholder="Lesson title in English" />
                            <textarea value={lesson.content} onChange={(e) => updateLesson(topic.id, lesson.id, "content", e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm" placeholder="Lesson content in English" rows={2} />
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          <input type="text" value={lesson.video_url || ""} onChange={(e) => updateLesson(topic.id, lesson.id, "video_url", e.target.value)}
                            placeholder={t("رابط الفيديو...", "Video URL...")}
                            className="flex-1 min-w-[200px] px-2 py-1 border rounded text-xs" />
                          <label className="flex items-center gap-1 text-xs text-gray-500">
                            <input type="checkbox" checked={lesson.is_free} onChange={(e) => updateLesson(topic.id, lesson.id, "is_free", e.target.checked)} />
                            {t("مجاني", "Free")}
                          </label>
                          <input type="number" value={lesson.duration || 0} onChange={(e) => updateLesson(topic.id, lesson.id, "duration", parseInt(e.target.value) || 0)}
                            className="w-16 px-1 py-1 border rounded text-xs" placeholder={t("د", "min")} title={t("المدة بالدقائق", "Duration in minutes")} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => addLesson(topic.id)} className="px-3 py-1.5 text-xs border border-dashed border-gray-300 rounded-lg hover:bg-gray-100">
                    + {t("درس", "Lesson")}
                  </button>
                  <button onClick={() => addQuiz(topic.id)} className="px-3 py-1.5 text-xs border border-dashed border-gray-300 rounded-lg hover:bg-gray-100">
                    + {t("اختبار", "Quiz")}
                  </button>
                  <button className="px-3 py-1.5 text-xs border border-dashed border-gray-300 rounded-lg hover:bg-gray-100">
                    + {t("اختبار تفاعلي", "Interactive Quiz")}
                  </button>
                  <button className="px-3 py-1.5 text-xs border border-dashed border-gray-300 rounded-lg hover:bg-gray-100">
                    + {t("واجب", "Assignment")}
                  </button>
                </div>
              </div>
            ))}

            <div className="border border-dashed border-everest-300 rounded-lg p-4 mb-3">
              <LangSwitch />
              {inputLang === "ar" ? (
                <>
                  <input type="text" value={newTopic.title_ar} onChange={(e) => setNewTopic((prev) => ({ ...prev, title_ar: e.target.value }))}
                    placeholder="عنوان الموضوع الجديد بالعربية" className="w-full px-3 py-2 border rounded-lg mb-2" />
                  <textarea value={newTopic.summary_ar} onChange={(e) => setNewTopic((prev) => ({ ...prev, summary_ar: e.target.value }))}
                    placeholder="ملخص الموضوع بالعربية" className="w-full px-3 py-2 border rounded-lg mb-2 text-sm" rows={2} />
                </>
              ) : (
                <>
                  <input type="text" value={newTopic.title} onChange={(e) => setNewTopic((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="New topic title in English" className="w-full px-3 py-2 border rounded-lg mb-2" />
                  <textarea value={newTopic.summary} onChange={(e) => setNewTopic((prev) => ({ ...prev, summary: e.target.value }))}
                    placeholder="Topic summary in English" className="w-full px-3 py-2 border rounded-lg mb-2 text-sm" rows={2} />
                </>
              )}
              <button onClick={addTopic} className="px-4 py-2 bg-everest-600 text-white rounded-lg text-sm">
                + {t("إضافة موضوع", "Add Topic")}
              </button>
            </div>

            <button onClick={saveCourse} disabled={saving}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50">
              {saving ? t("جاري الحفظ...", "Saving...") : t("حفظ الكورس كاملاً", "Save Full Course")}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h4 className="font-bold mb-3">{t("الرؤية", "Visibility")}</h4>
            <select value={course.status || "published"} onChange={(e) => handleChange("status", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="published">{t("نشر فوري", "Publish Now")}</option>
              <option value="draft">{t("مسودة", "Draft")}</option>
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h4 className="font-bold mb-3">{t("صورة الغلاف", "Cover Image")}</h4>
            {course.featured_image ? (
              <div className="relative mb-2">
                <img src={course.featured_image} alt="cover" className="w-full h-32 object-cover rounded-lg" />
                <button onClick={() => handleChange("featured_image", "")} className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✕</button>
              </div>
            ) : null}
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-400 text-sm cursor-pointer hover:border-everest-400 block">
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                const fd = new FormData(); fd.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: fd });
                if (res.ok) { const d = await res.json(); handleChange("featured_image", d.url); }
              }} />
              {t("اضغط لرفع الصورة", "Click to upload image")}
            </label>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h4 className="font-bold mb-3">{t("فيديو المقدمة", "Intro Video")}</h4>
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-400 text-sm cursor-pointer hover:border-everest-400 block">
              <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                const fd = new FormData(); fd.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: fd });
                if (res.ok) { const d = await res.json(); handleChange("intro_video", d.url); }
              }} />
              {t("اضغط لرفع الفيديو", "Click to upload video")}
            </label>
            {course.intro_video ? (
              <p className="text-xs text-green-600 mt-1 truncate">{course.intro_video.split("/").pop()}</p>
            ) : null}
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h4 className="font-bold mb-3">{t("نموذج التسعير", "Pricing")}</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="pricing" checked={course.is_free} onChange={() => handleChange("is_free", true)} />
                <span className="text-sm">{t("مجاني", "Free")}</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="pricing" checked={!course.is_free} onChange={() => handleChange("is_free", false)} />
                <span className="text-sm">{t("مدفوع", "Paid")}</span>
              </label>
              {!course.is_free && (
                <input type="number" value={course.price} onChange={(e) => handleChange("price", e.target.value)}
                  placeholder={t("السعر", "Price")} className="w-full px-3 py-2 border rounded-lg text-sm mt-2" />
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h4 className="font-bold mb-3">{t("التصنيفات", "Categories")}</h4>
            <input type="text" placeholder={t("بحث...", "Search...")} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {["تداول", "تسويق", "برمجة", "ذكاء اصطناعي", "فريلانس", "تصميم"].map((cat) => (
                <label key={cat} className="flex items-center gap-2">
                  <input type="checkbox" /> <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h4 className="font-bold mb-3">{t("الوسوم", "Tags")}</h4>
            <input type="text" value={course.tags} onChange={(e) => handleChange("tags", e.target.value)}
              placeholder={t("أدخل وسماً...", "Enter a tag...")} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
