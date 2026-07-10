import React, { useState, useEffect } from "react";

const api = (path, opts = {}) =>
  fetch(path, { headers: { "Content-Type": "application/json" }, ...opts }).then((r) => r.json());

export default function QuizAttemptsPage() {
  const [attempts, setAttempts] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("attempts");

  useEffect(() => {
    api("/api/courses/attempts").then(setAttempts);
    api("/api/users").then(setStudents);
  }, []);

  const Table1 = () => (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full table-data">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
            <th><input type="checkbox" /></th>
            <th>الاختبار والتاريخ</th>
            <th>الكورس</th>
            <th>عدد الأسئلة</th>
            <th>الدرجة الكلية</th>
            <th>إجابات صحيحة</th>
            <th>إجابات خاطئة</th>
            <th>الدرجة المحققة</th>
            <th>النتيجة</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((a) => {
            const pct = a.total_marks > 0 ? ((a.earned_marks / a.total_marks) * 100).toFixed(0) : 0;
            return (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td><input type="checkbox" /></td>
                <td>
                  <p className="font-medium text-sm">{a.quiz_title}</p>
                  <p className="text-xs text-gray-400">{a.student_name} · {new Date(a.created_at).toLocaleDateString("ar-EG")}</p>
                </td>
                <td className="text-sm">{a.course_name}</td>
                <td className="text-sm">{a.total_marks}</td>
                <td className="text-sm">{a.total_marks}</td>
                <td className="text-sm text-green-600 font-medium">{a.correct_answers}</td>
                <td className="text-sm text-red-600 font-medium">{a.incorrect_answers}</td>
                <td className="text-sm font-medium">{a.earned_marks} / {a.total_marks} ({pct}%)</td>
                <td>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    a.result === "pass" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {a.result === "pass" ? "ناجح" : "راسب"}
                  </span>
                </td>
                <td><button className="text-blue-600 text-sm">تفاصيل</button></td>
              </tr>
            );
          })}
          {attempts.length === 0 && (
            <tr><td colSpan="10" className="text-center text-gray-400 py-8">لا توجد محاولات</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const Table2 = () => (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full table-data">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
            <th><input type="checkbox" /></th>
            <th>الطالب</th>
            <th>البريد</th>
            <th>تاريخ التسجيل</th>
            <th>الكورسات المسجلة</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {students.filter((u) => u.role === "student").map((s) => (
            <tr key={s.id} className="border-t hover:bg-gray-50">
              <td><input type="checkbox" /></td>
              <td>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-everest-100 rounded-full flex items-center justify-center text-everest-700 font-bold text-sm">
                    {s.full_name?.[0] || "?"}
                  </div>
                  <span className="font-medium text-sm">{s.full_name}</span>
                </div>
              </td>
              <td className="text-sm text-gray-500">{s.email}</td>
              <td className="text-sm text-gray-400">{new Date(s.created_at).toLocaleDateString("ar-EG")}</td>
              <td className="text-sm">—</td>
              <td>
                <select className="px-2 py-1 border rounded text-xs">
                  <option>عرض التفاصيل</option>
                  <option>تعديل</option>
                  <option>حظر</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📋 التقارير</h2>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("attempts")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === "attempts" ? "bg-everest-600 text-white" : "bg-white border text-gray-600"
          }`}
        >
          نتائج الاختبارات
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === "students" ? "bg-everest-600 text-white" : "bg-white border text-gray-600"
          }`}
        >
          قائمة الطلاب
        </button>
      </div>

      {activeTab === "attempts" && <Table1 />}
      {activeTab === "students" && <Table2 />}
    </div>
  );
}
