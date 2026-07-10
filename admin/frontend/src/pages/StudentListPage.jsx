import React, { useState, useEffect } from "react";

const api = (path, opts = {}) =>
  fetch(path, { headers: { "Content-Type": "application/json" }, ...opts }).then((r) => r.json());

export default function StudentListPage() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    api("/api/users").then((users) => setStudents(users.filter((u) => u.role === "student")));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🎓 قائمة الطلاب</h2>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-3 flex-wrap">
          <input type="text" placeholder="بحث..." className="px-4 py-2 border rounded-lg text-sm flex-1 min-w-[150px]" />
          <select className="px-4 py-2 border rounded-lg text-sm bg-white">
            <option>كل الرتب</option>
            <option>Star</option>
            <option>Executive</option>
            <option>Gold</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {students.map((s) => (
            <div key={s.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-everest-100 rounded-full flex items-center justify-center text-everest-700 font-bold">
                  {s.full_name?.[0] || "?"}
                </div>
                <div>
                  <p className="font-medium text-sm">{s.full_name}</p>
                  <p className="text-xs text-gray-400">{s.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs border-t pt-3">
                <div>
                  <span className="text-gray-400">الرتبة:</span>
                  <span className="mr-1 font-medium">⭐ {s.rank}</span>
                </div>
                <div>
                  <span className="text-gray-400">الرصيد:</span>
                  <span className="mr-1 font-medium text-green-600">{s.e_money}</span>
                </div>
                <div>
                  <span className="text-gray-400">الرجوع:</span>
                  <span className="mr-1 font-medium">{s.referral_code || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-400">مباشر:</span>
                  <span className="mr-1 font-medium">{s.direct_count || 0}</span>
                </div>
              </div>
            </div>
          ))}
          {students.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-8">لا يوجد طلاب</div>
          )}
        </div>
      </div>
    </div>
  );
}
