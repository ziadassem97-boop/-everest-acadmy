import React, { useState, useEffect } from "react";
import { useLang } from "../LangContext";

const api = async (path, opts = {}) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const statusOpts = [
  { ar: "منشور", en: "Published", val: "published" },
  { ar: "مسودة", en: "Draft", val: "draft" },
];

export default function CoursesListPage() {
  const { lang } = useLang();
  const t = (ar, en) => (lang === "ar" ? ar : en);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [editCourse, setEditCourse] = useState(null);
  const [detail, setDetail] = useState(null);
  const [tab, setTab] = useState("info");
  const [viewCourse, setViewCourse] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [playingLesson, setPlayingLesson] = useState(null);
  const [newLessonTopic, setNewLessonTopic] = useState(null);
  const [showStudents, setShowStudents] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({ status: "", expires_at: "" });
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonAr, setNewLessonAr] = useState("");
  const [newLessonVideo, setNewLessonVideo] = useState("");
  const [newLessonContent, setNewLessonContent] = useState("");
  const [newLessonContentAr, setNewLessonContentAr] = useState("");

  const load = () => api("/api/courses").then(setCourses).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!editCourse) { setDetail(null); return; }
    api(`/api/courses/${editCourse.id}`).then(setDetail);
  }, [editCourse]);

  useEffect(() => {
    if (!viewCourse) { setViewData(null); setPlayingLesson(null); return; }
    api(`/api/courses/${viewCourse.id}`).then(setViewData);
  }, [viewCourse]);

  const delCourse = async (id) => {
    if (!confirm(t("متأكد من حذف هذا الكورس؟", "Delete this course?"))) return;
    await api(`/api/courses/${id}`, { method: "DELETE" });
    load();
  };

  const saveCourse = async () => {
    if (!detail) return;
    await api(`/api/courses/${detail.id}`, { method: "PUT", body: JSON.stringify(detail) });
    const fresh = await api(`/api/courses/${detail.id}`);
    setDetail(fresh);
    setEditCourse(fresh);
    load();
    alert(t("تم التحديث", "Updated"));
  };

  const addTopic = async () => {
    const title = prompt(t("عنوان الموضوع:", "Topic title:"));
    if (!title) return;
    await api(`/api/courses/${detail.id}/topics`, { method: "POST", body: JSON.stringify({ title }) });
    const fresh = await api(`/api/courses/${detail.id}`);
    setDetail(fresh);
    load();
  };

  const updateTopic = async (topic) => {
    await api(`/api/courses/topics/${topic.id}`, { method: "PUT", body: JSON.stringify(topic) });
    const fresh = await api(`/api/courses/${detail.id}`);
    setDetail(fresh);
    load();
  };

  const delTopic = async (id) => {
    if (!confirm(t("حذف الموضوع؟", "Delete topic?"))) return;
    await api(`/api/courses/topics/${id}`, { method: "DELETE" });
    const fresh = await api(`/api/courses/${detail.id}`);
    setDetail(fresh);
    load();
  };

  const addLesson = async (topicId) => {
    if (!newLessonTitle.trim()) return;
    try {
      await api(`/api/courses/topics/${topicId}/lessons`, { method: "POST", body: JSON.stringify({ title: newLessonTitle, title_ar: newLessonAr, video_url: newLessonVideo, content: newLessonContent, content_ar: newLessonContentAr }) });
      const fresh = await api(`/api/courses/${detail.id}`);
      setDetail(fresh);
      load();
      setNewLessonTopic(null);
      setNewLessonTitle("");
      setNewLessonAr("");
      setNewLessonVideo("");
      setNewLessonContent("");
      setNewLessonContentAr("");
    } catch (err) {
      alert(t("خطأ في إضافة الدرس: ", "Error adding lesson: ") + err.message);
    }
  };

  const updateLesson = async (topicId, lesson) => {
    try {
      await api(`/api/courses/topics/${topicId}/lessons/${lesson.id}`, { method: "PUT", body: JSON.stringify(lesson) });
      const fresh = await api(`/api/courses/${detail.id}`);
      setDetail(fresh);
      load();
      alert(t("تم حفظ الدرس ✅", "Lesson saved ✅"));
    } catch (err) {
      alert(t("خطأ في حفظ الدرس: ", "Error saving lesson: ") + err.message);
    }
  };

  const delLesson = async (topicId, id) => {
    if (!confirm(t("حذف الدرس؟", "Delete lesson?"))) return;
    try {
      await api(`/api/courses/topics/${topicId}/lessons/${id}`, { method: "DELETE" });
      const fresh = await api(`/api/courses/${detail.id}`);
      setDetail(fresh);
      load();
    } catch (err) {
      alert(t("خطأ في حذف الدرس: ", "Error deleting lesson: ") + err.message);
    }
  };

  const addQuiz = async (topicId) => {
    const title = prompt(t("عنوان الاختبار:", "Quiz title:"));
    if (!title) return;
    await api(`/api/courses/topics/${topicId}/quizzes`, { method: "POST", body: JSON.stringify({ title }) });
    const fresh = await api(`/api/courses/${detail.id}`);
    setDetail(fresh);
    load();
  };

  const delQuiz = async (topicId, id) => {
    if (!confirm(t("حذف الاختبار؟", "Delete quiz?"))) return;
    await api(`/api/courses/topics/${topicId}/quizzes/${id}`, { method: "DELETE" });
    const fresh = await api(`/api/courses/${detail.id}`);
    setDetail(fresh);
    load();
  };

  const loadStudents = async (courseId) => {
    if (showStudents === courseId) { setShowStudents(null); setStudents([]); return; }
    setShowStudents(courseId);
    setLoadingStudents(true);
    setEditStudent(null);
    try { const data = await api(`/api/courses/enrollments/list/${courseId}`); setStudents(data); }
    catch (e) { alert(e.message); }
    setLoadingStudents(false);
  };

  const deleteStudent = async (id, name) => {
    if (!confirm(t(`حذف الطالب ${name} من هذا الكورس؟`, `Delete ${name} from this course?`))) return;
    try { await api(`/api/courses/enrollments/${id}`, { method: "DELETE" }); if (showStudents) loadStudents(showStudents); }
    catch (e) { alert(e.message); }
  };

  const saveStudent = async (id) => {
    try {
      await api(`/api/courses/enrollments/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: studentForm.status || undefined, expires_at: studentForm.expires_at || undefined })
      });
      setEditStudent(null);
      if (showStudents) loadStudents(showStudents);
    } catch (e) { alert(e.message); }
  };

  const startEditStudent = (enr) => {
    setEditStudent(enr.id);
    setStudentForm({ status: enr.status || "", expires_at: enr.expires_at || "" });
  };

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || (c.title || "").toLowerCase().includes(q) || (c.title_ar || "").includes(q);
    const matchCat = !catFilter || c.category === catFilter || c.category_ar === catFilter;
    return matchSearch && matchCat;
  });

  const categories = [...new Set(courses.flatMap((c) => [c.category, c.category_ar].filter(Boolean)))];

  /* ───── Edit Modal ───── */
  if (editCourse && detail) {
    const cv = detail;
    const setCv = (field, value) => setDetail((prev) => ({ ...prev, [field]: value }));
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-10 pb-10 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <h3 className="text-lg font-bold">{t("تعديل الكورس", "Edit Course")}</h3>
            <button onClick={() => { setEditCourse(null); setDetail(null); }} className="text-gray-400 hover:text-black text-xl">✕</button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-6 pt-4 border-b">
            {[
              { id: "info", ar: "معلومات الكورس", en: "Course Info" },
              { id: "curriculum", ar: "المنهج", en: "Curriculum" },
            ].map((tb) => (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${tab === tb.id ? "bg-everest-600 text-white" : "bg-gray-100 text-gray-500"}`}
              >{lang === "ar" ? tb.ar : tb.en}</button>
            ))}
          </div>

          {tab === "info" && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">English Title</label>
                  <input value={cv.title || ""} onChange={(e) => setCv("title", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium">العنوان بالعربية</label>
                  <input value={cv.title_ar || ""} onChange={(e) => setCv("title_ar", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">English Description</label>
                  <textarea value={cv.description || ""} onChange={(e) => setCv("description", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">الوصف بالعربية</label>
                  <textarea value={cv.description_ar || ""} onChange={(e) => setCv("description_ar", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} />
                </div>
                <div>
                  <label className="text-sm font-medium">{t("التصنيف", "Category")}</label>
                  <input value={cv.category || ""} onChange={(e) => setCv("category", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium">التصنيف بالعربية</label>
                  <input value={cv.category_ar || ""} onChange={(e) => setCv("category_ar", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium">{t("الصعوبة", "Difficulty")}</label>
                  <select value={cv.difficulty || "beginner"} onChange={(e) => setCv("difficulty", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="beginner">{t("مبتدئ", "Beginner")}</option>
                    <option value="intermediate">{t("متوسط", "Intermediate")}</option>
                    <option value="advanced">{t("متقدم", "Advanced")}</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">{t("الحالة", "Status")}</label>
                  <select value={cv.status || "draft"} onChange={(e) => setCv("status", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                    {statusOpts.map((o) => <option key={o.val} value={o.val}>{lang === "ar" ? o.ar : o.en}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">{t("السعر", "Price")}</label>
                  <input type="number" value={cv.price || 0} onChange={(e) => setCv("price", parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={cv.is_free} onChange={(e) => setCv("is_free", e.target.checked)} />
                    {t("مجاني", "Free")}
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={cv.is_public} onChange={(e) => setCv("is_public", e.target.checked)} />
                    {t("عام", "Public")}
                  </label>
                </div>
                <div>
                  <label className="text-sm font-medium">{t("صورة الغلاف", "Cover Image")}</label>
                  <div className="flex items-center gap-3 mt-1">
                    {cv.featured_image ? (
                      <div className="relative">
                        <img src={cv.featured_image} alt="" className="w-20 h-14 object-cover rounded border" />
                        <button onClick={() => setCv("featured_image", "")} className="absolute -top-1.5 -left-1.5 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">✕</button>
                      </div>
                    ) : null}
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center text-gray-400 text-xs cursor-pointer hover:border-everest-400 block flex-1">
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        const fd = new FormData(); fd.append("file", file);
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        if (res.ok) { const d = await res.json(); setCv("featured_image", d.url); }
                      }} />
                      {t("اضغط لرفع الصورة", "Click to upload image")}
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button onClick={saveCourse} className="px-6 py-2 bg-everest-600 text-white rounded-lg text-sm font-medium">{t("حفظ التغييرات", "Save Changes")}</button>
                <button onClick={() => { setEditCourse(null); setDetail(null); }} className="px-6 py-2 border rounded-lg text-sm">{t("إلغاء", "Cancel")}</button>
              </div>
            </div>
          )}

          {tab === "curriculum" && (
            <div className="p-6 space-y-4">
              {(cv.topics || []).map((topic) => (
                <div key={topic.id} className="border rounded-lg p-4 bg-gray-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <input value={topic.title || ""} onChange={(e) => {
                      const updated = { ...topic, title: e.target.value };
                      setDetail((prev) => ({ ...prev, topics: prev.topics.map((t) => t.id === topic.id ? updated : t) }));
                    }} className="flex-1 px-2 py-1 border rounded text-sm font-medium" placeholder="English title" />
                    <input value={topic.title_ar || ""} onChange={(e) => {
                      const updated = { ...topic, title_ar: e.target.value };
                      setDetail((prev) => ({ ...prev, topics: prev.topics.map((t) => t.id === topic.id ? updated : t) }));
                    }} className="flex-1 px-2 py-1 border rounded text-sm" placeholder="العنوان بالعربية" />
                    <button onClick={() => updateTopic(topic)} className="text-xs text-everest-600 border px-2 py-1 rounded">{t("حفظ", "Save")}</button>
                    <button onClick={() => delTopic(topic.id)} className="text-xs text-red-500 border px-2 py-1 rounded">✕</button>
                  </div>

                  <div className="mr-4 space-y-1">
                    {(topic.lessons || []).map((lesson) => (
                      <div key={lesson.id} className="bg-white rounded border p-2 mb-1 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <input value={lesson.title || ""} onChange={(e) => {
                            const upd = { ...lesson, title: e.target.value };
                            setDetail((prev) => ({ ...prev, topics: prev.topics.map((t) => t.id === topic.id
                              ? { ...t, lessons: t.lessons.map((l) => l.id === lesson.id ? upd : l) } : t) }));
                          }} className="flex-1 px-1 border-b text-xs" placeholder="EN title" />
                          <input value={lesson.title_ar || ""} onChange={(e) => {
                            const upd = { ...lesson, title_ar: e.target.value };
                            setDetail((prev) => ({ ...prev, topics: prev.topics.map((t) => t.id === topic.id
                              ? { ...t, lessons: t.lessons.map((l) => l.id === lesson.id ? upd : l) } : t) }));
                          }} className="flex-1 px-1 border-b text-xs" placeholder="العنوان بالعربية" />
                        </div>
                        <div className="flex items-center gap-2">
                          <textarea value={lesson.content || ""} onChange={(e) => {
                            const upd = { ...lesson, content: e.target.value };
                            setDetail((prev) => ({ ...prev, topics: prev.topics.map((t) => t.id === topic.id
                              ? { ...t, lessons: t.lessons.map((l) => l.id === lesson.id ? upd : l) } : t) }));
                          }} className="flex-1 px-2 py-1 border rounded text-xs" rows={2} placeholder={t("محتوى (إنجليزي)", "Content (EN)")} />
                          <textarea value={lesson.content_ar || ""} onChange={(e) => {
                            const upd = { ...lesson, content_ar: e.target.value };
                            setDetail((prev) => ({ ...prev, topics: prev.topics.map((t) => t.id === topic.id
                              ? { ...t, lessons: t.lessons.map((l) => l.id === lesson.id ? upd : l) } : t) }));
                          }} className="flex-1 px-2 py-1 border rounded text-xs" rows={2} placeholder={t("المحتوى (عربي)", "Content (AR)")} />
                        </div>
                        <div className="flex items-center gap-2">
                          <input value={lesson.video_url || ""} onChange={(e) => {
                            const upd = { ...lesson, video_url: e.target.value };
                            setDetail((prev) => ({ ...prev, topics: prev.topics.map((t) => t.id === topic.id
                              ? { ...t, lessons: t.lessons.map((l) => l.id === lesson.id ? upd : l) } : t) }));
                          }} className="flex-1 px-2 py-1 border rounded text-xs" placeholder={t("رابط فيديو (YouTube)...", "Video URL (YouTube)...")} />
                          <label className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 whitespace-nowrap font-medium">
                            {t("رفع فيديو من الجهاز", "Upload Video")}
                            <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0]; if (!file) return;
                              const fd = new FormData(); fd.append("file", file);
                              const res = await fetch("/api/upload", { method: "POST", body: fd });
                              if (res.ok) { const d = await res.json();
                                const upd = { ...lesson, video_url: d.url };
                                setDetail((prev) => ({ ...prev, topics: prev.topics.map((t) => t.id === topic.id
                                  ? { ...t, lessons: t.lessons.map((l) => l.id === lesson.id ? upd : l) } : t) }));
                                await updateLesson(topic.id, { ...lesson, video_url: d.url });
                              }
                            }} />
                          </label>
                          <button onClick={() => updateLesson(topic.id, lesson)} className="px-3 py-1.5 text-xs bg-everest-600 text-white rounded-lg">💾</button>
                          <button onClick={() => delLesson(topic.id, lesson.id)} className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg">✕</button>
                        </div>
                        {lesson.video_url && <p className="text-xs text-green-600 mt-1 truncate">{lesson.video_url}</p>}
                      </div>
                    ))}
                    {(topic.quizzes || []).map((quiz) => (
                      <div key={quiz.id} className="flex items-center gap-2 bg-yellow-50 rounded px-3 py-1.5 border text-sm">
                        <span className="text-xs">📝</span>
                        <span>{quiz.title}</span>
                        <button onClick={() => delQuiz(topic.id, quiz.id)} className="text-xs text-red-500 mr-auto">✕</button>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      {newLessonTopic === topic.id ? (
                        <div className="flex flex-col gap-2 w-full bg-gray-100 rounded-lg p-3 border">
                          <div className="flex items-center gap-2">
                            <input value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)}
                              placeholder={t("عنوان الدرس (إنجليزي)", "Lesson title (English)")}
                              className="flex-1 px-2 py-1 border rounded text-xs" autoFocus />
                            <input value={newLessonAr} onChange={(e) => setNewLessonAr(e.target.value)}
                              placeholder={t("عنوان الدرس (عربي)", "Lesson title (Arabic)")}
                              className="flex-1 px-2 py-1 border rounded text-xs" />
                          </div>
                          <div className="flex items-center gap-2">
                            <textarea value={newLessonContent} onChange={(e) => setNewLessonContent(e.target.value)}
                              placeholder={t("محتوى الدرس (إنجليزي)", "Lesson content (English)")}
                              className="flex-1 px-2 py-1 border rounded text-xs" rows={2} />
                            <textarea value={newLessonContentAr} onChange={(e) => setNewLessonContentAr(e.target.value)}
                              placeholder={t("محتوى الدرس (عربي)", "Lesson content (Arabic)")}
                              className="flex-1 px-2 py-1 border rounded text-xs" rows={2} />
                          </div>
                          <div className="flex items-center gap-2">
                            <input value={newLessonVideo} onChange={(e) => setNewLessonVideo(e.target.value)}
                              placeholder={t("رابط فيديو (YouTube)...", "Video URL (YouTube)...")}
                              className="flex-1 px-2 py-1 border rounded text-xs" />
                            <label className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 whitespace-nowrap font-medium">
                              {t("رفع فيديو", "Upload")}
                              <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                                const file = e.target.files?.[0]; if (!file) return;
                                const fd = new FormData(); fd.append("file", file);
                                const res = await fetch("/api/upload", { method: "POST", body: fd });
                                if (res.ok) { const d = await res.json(); setNewLessonVideo(d.url); }
                              }} />
                            </label>
                            <button onClick={() => addLesson(topic.id)} className="px-3 py-1.5 text-xs bg-everest-600 text-white rounded-lg">{t("حفظ", "Save")}</button>
                            <button onClick={() => { setNewLessonTopic(null); setNewLessonTitle(""); setNewLessonAr(""); setNewLessonVideo(""); }} className="px-3 py-1.5 text-xs border rounded-lg">{t("إلغاء", "Cancel")}</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => { setNewLessonTopic(topic.id); setNewLessonTitle(""); setNewLessonAr(""); }} className="text-xs border border-dashed border-gray-300 px-3 py-1 rounded hover:bg-gray-100">
                            + {t("درس", "Lesson")}
                          </button>
                          <button onClick={() => addQuiz(topic.id)} className="text-xs border border-dashed border-gray-300 px-3 py-1 rounded hover:bg-gray-100">
                            + {t("اختبار", "Quiz")}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addTopic} className="w-full py-2 border-2 border-dashed border-everest-300 text-everest-600 rounded-lg text-sm font-medium hover:bg-everest-50">
                + {t("إضافة موضوع", "Add Topic")}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ───── View / Play Modal ───── */
  const isYoutube = (url) => url && (url.includes("youtube.com") || url.includes("youtu.be"));
  const getYoutubeEmbed = (url) => {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  };

  if (viewCourse && viewData) {
    const allLessons = (viewData.topics || []).flatMap((t) => (t.lessons || []).map((l) => ({ ...l, topicTitle: t.title || t.title_ar })));
    const current = playingLesson || allLessons[0] || null;
    const total = allLessons.length;
    const idx = allLessons.findIndex((l) => l.id === current?.id);

    const videoSrc = current?.video_url
      ? isYoutube(current.video_url) ? getYoutubeEmbed(current.video_url) : current.video_url
      : null;

    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setViewCourse(null)}>
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <div>
              <h3 className="font-bold text-lg">{viewData.title_ar || viewData.title}</h3>
              <p className="text-xs text-gray-400">{viewData.title && viewData.title_ar ? viewData.title : ""}</p>
            </div>
            <button onClick={() => setViewCourse(null)} className="text-gray-400 hover:text-black text-xl">✕</button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar - Lessons List */}
            <div className="w-64 border-l overflow-y-auto bg-gray-50 p-3 space-y-1 hidden md:block">
              {(viewData.topics || []).map((topic) => (
                <div key={topic.id}>
                  <p className="text-xs font-bold text-gray-500 mt-3 mb-1 px-2">{topic.title_ar || topic.title}</p>
                  {(topic.lessons || []).map((lesson) => (
                    <button key={lesson.id} onClick={() => setPlayingLesson(lesson)}
                      className={`w-full text-right px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${current?.id === lesson.id ? "bg-everest-600 text-white" : "hover:bg-gray-200 text-gray-700"}`}
                    >
                      <span className="text-xs">{current?.id === lesson.id ? "▶" : "🎬"}</span>
                      <span className="truncate">{lesson.title_ar || lesson.title}</span>
                    </button>
                  ))}
                </div>
              ))}
              {(!viewData.topics || viewData.topics.length === 0) && (
                <p className="text-xs text-gray-400 p-3">{t("لا توجد دروس", "No lessons yet")}</p>
              )}
            </div>

            {/* Video Player */}
            <div className="flex-1 flex flex-col">
              <div className="bg-black flex-1 flex items-center justify-center min-h-[300px]">
                {videoSrc ? (
                  isYoutube(current.video_url) ? (
                    <iframe src={videoSrc} className="w-full h-full min-h-[300px]" allowFullScreen title="video" />
                  ) : (
                    <video src={videoSrc} controls className="w-full h-full max-h-[60vh]" autoPlay />
                  )
                ) : (
                  <div className="text-gray-500 text-center">
                    <p className="text-4xl mb-2">🎬</p>
                    <p className="text-sm">{t("هذا الدرس لا يحتوي على فيديو", "This lesson has no video")}</p>
                  </div>
                )}
              </div>
              {current && (
                <div className="px-6 py-3 border-t bg-white flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{current.title_ar || current.title}</p>
                    <p className="text-xs text-gray-400">{current.topicTitle}</p>
                  </div>
                  <div className="flex gap-2">
                    {idx > 0 && <button onClick={() => setPlayingLesson(allLessons[idx - 1])} className="px-4 py-1.5 border rounded text-sm">{t("السابق", "Prev")}</button>}
                    {idx < total - 1 && <button onClick={() => setPlayingLesson(allLessons[idx + 1])} className="px-4 py-1.5 bg-everest-600 text-white rounded text-sm">{t("التالي", "Next")}</button>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ───── Courses Table ───── */
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t("قائمة الكورسات", "Courses List")}</h2>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-3 flex-wrap">
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="px-4 py-2 border rounded-lg text-sm bg-white">
            <option value="">{t("كل التصنيفات", "All Categories")}</option>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("بحث...", "Search...")} className="px-4 py-2 border rounded-lg text-sm flex-1 min-w-[150px]" />
          <span className="text-xs text-gray-400">{t(`${filtered.length} كورس`, `${filtered.length} courses`)}</span>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
              <th className="p-3 text-right">{t("صورة", "Image")}</th>
              <th className="p-3 text-right">{t("العنوان", "Title")}</th>
              <th className="p-3 text-right">{t("التصنيف", "Category")}</th>
              <th className="p-3 text-right">{t("السعر", "Price")}</th>
              <th className="p-3 text-right">{t("المؤلف", "Author")}</th>
              <th className="p-3 text-right">{t("الحالة", "Status")}</th>
              <th className="p-3 text-right">{t("إجراءات", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <React.Fragment key={c.id}>
              <tr className="border-t hover:bg-gray-50">
                <td className="p-3">
                  {c.featured_image
                    ? <img src={c.featured_image} alt="" className="w-14 h-10 object-cover rounded" />
                    : <div className="w-14 h-10 bg-gray-200 rounded" />}
                </td>
                <td className="p-3">
                  <p className="font-medium text-sm">{c.title || c.title_ar}</p>
                  <p className="text-xs text-gray-400">
                    {c.topic_count || 0} {t("مواضيع", "topics")} · {c.lesson_count || 0} {t("دروس", "lessons")} · {c.quiz_count || 0} {t("اختبارات", "quizzes")}
                  </p>
                  {c.title && c.title_ar && <p className="text-xs text-gray-400 mt-0.5">{c.title_ar}</p>}
                </td>
                <td className="p-3 text-xs text-gray-500">{c.category_ar || c.category || "—"}</td>
                <td className="p-3 text-sm font-medium">{c.is_free ? (t("مجاني", "Free")) : `${c.price} ${t("ج.م", "EGP")}`}</td>
                <td className="p-3 text-xs">{c.author_name || "—"}</td>
                <td className="p-3">
                  <select value={c.status || "draft"} onChange={async (e) => {
                    await api(`/api/courses/${c.id}`, { method: "PUT", body: JSON.stringify({ ...c, status: e.target.value }) });
                    load();
                  }} className="px-2 py-1 border rounded text-xs">
                    {statusOpts.map((o) => <option key={o.val} value={o.val}>{lang === "ar" ? o.ar : o.en}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button onClick={() => { setViewCourse(c); }} className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700">
                      {t("عرض", "View")}
                    </button>
                    <button onClick={() => setEditCourse(c)} className="px-3 py-1.5 text-xs bg-everest-600 text-white rounded-lg hover:bg-everest-700">
                      {t("تعديل", "Edit")}
                    </button>
                    <button onClick={() => loadStudents(c.id)} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      {showStudents === c.id ? t("إخفاء", "Hide") : t("الطلاب", "Students")}
                    </button>
                    <button onClick={() => delCourse(c.id)} className="px-3 py-1.5 text-xs border border-red-300 text-red-500 rounded-lg hover:bg-red-50">
                      {t("حذف", "Delete")}
                    </button>
                  </div>
                </td>
              </tr>
              {showStudents === c.id && (
                <tr><td colSpan={7} className="p-0">
                  <div className="bg-gray-50 p-4 border-t">
                    {loadingStudents ? (
                      <p className="text-sm text-gray-400">{t("جاري التحميل...", "Loading...")}</p>
                    ) : students.length === 0 ? (
                      <p className="text-sm text-gray-400">{t("لا يوجد طلاب مسجلين في هذا الكورس", "No students enrolled in this course")}</p>
                    ) : (
                      <div>
                        <p className="text-sm font-bold mb-3">🎓 {t("الطلاب المسجلين", "Enrolled Students")} ({students.length})</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs bg-white rounded-lg border">
                            <thead>
                              <tr className="bg-gray-100 text-gray-500 uppercase">
                                <th className="p-2 text-right">{t("الطالب", "Student")}</th>
                                <th className="p-2 text-right">{t("الايميل", "Email")}</th>
                                <th className="p-2 text-right">{t("الهاتف", "Phone")}</th>
                                <th className="p-2 text-right">{t("الرتبة", "Rank")}</th>
                                <th className="p-2 text-right">{t("الحالة", "Status")}</th>
                                <th className="p-2 text-right">{t("طريقة الدفع", "Payment")}</th>
                                <th className="p-2 text-right">{t("تاريخ التسجيل", "Enrolled")}</th>
                                <th className="p-2 text-right">{t("تاريخ الانتهاء", "Expires")}</th>
                                <th className="p-2 text-right">{t("تحكم", "Actions")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {students.map((enr) => (
                                <tr key={enr.id} className="border-t hover:bg-gray-50">
                                  {editStudent === enr.id ? (
                                    <>
                                      <td className="p-2 font-medium">{enr.student_name}</td>
                                      <td className="p-2 text-gray-500">{enr.student_email}</td>
                                      <td className="p-2">{enr.student_phone || "—"}</td>
                                      <td className="p-2"><span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{enr.student_rank || "—"}</span></td>
                                      <td className="p-2">
                                        <select value={studentForm.status} onChange={(e) => setStudentForm({...studentForm, status: e.target.value})} className="px-2 py-1 border rounded text-xs">
                                          <option value="">—</option>
                                          <option value="approved">Approved</option>
                                          <option value="pending">Pending</option>
                                          <option value="rejected">Rejected</option>
                                        </select>
                                      </td>
                                      <td className="p-2 text-gray-500">{enr.payment_method}</td>
                                      <td className="p-2 text-gray-500">{enr.enrolled_at?.slice(0, 10)}</td>
                                      <td className="p-2">
                                        <input type="date" value={studentForm.expires_at} onChange={(e) => setStudentForm({...studentForm, expires_at: e.target.value})} className="px-2 py-1 border rounded text-xs" />
                                      </td>
                                      <td className="p-2">
                                        <div className="flex gap-1">
                                          <button onClick={() => saveStudent(enr.id)} className="px-2 py-1 text-xs bg-green-500 text-white rounded">{t("حفظ", "Save")}</button>
                                          <button onClick={() => setEditStudent(null)} className="px-2 py-1 text-xs border rounded">{t("إلغاء", "Cancel")}</button>
                                        </div>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="p-2 font-medium">{enr.student_name}</td>
                                      <td className="p-2 text-gray-500 text-xs">{enr.student_email}</td>
                                      <td className="p-2 text-gray-500">{enr.student_phone || "—"}</td>
                                      <td className="p-2"><span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{enr.student_rank || "—"}</span></td>
                                      <td className="p-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                          enr.status === "approved" ? "bg-green-100 text-green-700"
                                          : enr.status === "pending" ? "bg-yellow-100 text-yellow-700"
                                          : "bg-red-100 text-red-700"
                                        }`}>{enr.status}</span>
                                      </td>
                                      <td className="p-2 text-gray-500">{enr.payment_method}</td>
                                      <td className="p-2 text-gray-500">{enr.enrolled_at?.slice(0, 10)}</td>
                                      <td className="p-2 text-gray-500">{enr.expires_at?.slice(0, 10) || "—"}</td>
                                      <td className="p-2">
                                        <div className="flex gap-1">
                                          <button onClick={() => startEditStudent(enr)} title={t("تعديل", "Edit")} className="px-2 py-1 text-xs bg-blue-500 text-white rounded">{t("تعديل", "Edit")}</button>
                                          <button onClick={() => deleteStudent(enr.id, enr.student_name)} title={t("حذف", "Delete")} className="px-2 py-1 text-xs bg-red-500 text-white rounded">{t("حذف", "Delete")}</button>
                                        </div>
                                      </td>
                                    </>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </td></tr>
              )}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7" className="text-center text-gray-400 py-8">{t("لا توجد كورسات", "No courses found")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
