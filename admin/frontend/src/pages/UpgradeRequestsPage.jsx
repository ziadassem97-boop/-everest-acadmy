import React, { useState, useEffect } from "react";

const api = async (path, opts = {}) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body.error || `HTTP ${res.status}`); }
  return res.json();
};

export default function UpgradeRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");

  const load = (s) => { const st = s || filter; api("/api/users/upgrade-requests/list").then(setRequests).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try { await api(`/api/users/upgrade-requests/${id}/approve`, { method: "PUT" }); load(); }
    catch (e) { alert(e.message); }
  };

  const reject = async (id) => {
    if (!confirm("متأكد من رفض طلب الترقية؟")) return;
    try { await api(`/api/users/upgrade-requests/${id}/reject`, { method: "PUT" }); load(); }
    catch (e) { alert(e.message); }
  };

  const filtered = requests.filter((r) => {
    if (filter && r.status !== filter) return false;
    if (search && !r.full_name?.includes(search) && !r.email?.includes(search)) return false;
    return true;
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">⬆️ طلبات الترقية</h2>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-3 flex-wrap">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن طالب..." className="px-4 py-2 border rounded-lg text-sm flex-1 min-w-[200px]" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm bg-white">
            <option value="pending">قيد الانتظار</option>
            <option value="approved">تم الموافقة</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
              <th className="p-3 text-right">الطالب</th>
              <th className="p-3 text-right">الايميل</th>
              <th className="p-3 text-right">الهاتف</th>
              <th className="p-3 text-right">تاريخ الطلب</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{r.full_name}</td>
                <td className="p-3 text-xs text-gray-500">{r.email}</td>
                <td className="p-3 text-xs">{r.phone || "—"}</td>
                <td className="p-3 text-xs text-gray-500">{r.created_at?.slice(0, 10)}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    r.status === "approved" ? "bg-green-100 text-green-700"
                    : r.status === "pending" ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                  }`}>
                    {r.status === "pending" ? "قيد الانتظار" : r.status === "approved" ? "تم الموافقة" : "مرفوض"}
                  </span>
                </td>
                <td className="p-3">
                  {r.status === "pending" && (
                    <div className="flex gap-1">
                      <button onClick={() => approve(r.id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">
                        قبول
                      </button>
                      <button onClick={() => reject(r.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600">
                        رفض
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" className="text-center text-gray-400 py-8">لا توجد طلبات</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
