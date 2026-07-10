import React, { useState, useEffect } from "react";

const api = async (path, opts = {}) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export default function TopUpsPage() {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const load = (s) => { const st = s || filter; api(`/api/wallets/topups${st ? `?status=${st}` : ""}`).then(setRequests).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try { await api(`/api/wallets/topups/${id}/approve`, { method: "PUT" }); load(); }
    catch (e) { alert(e.message); }
  };

  const reject = async (id) => {
    if (!confirm("متأكد من رفض طلب الشحن؟")) return;
    try { await api(`/api/wallets/topups/${id}/reject`, { method: "PUT" }); load(); }
    catch (e) { alert(e.message); }
  };

  const filtered = requests.filter(
    (r) => !search || r.full_name?.includes(search) || r.email?.includes(search)
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">💰 طلبات شحن الرصيد</h2>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-3 flex-wrap">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن طالب..." className="px-4 py-2 border rounded-lg text-sm flex-1 min-w-[200px]" />
          <select value={filter} onChange={(e) => { setFilter(e.target.value); load(e.target.value); }}
            className="px-4 py-2 border rounded-lg text-sm bg-white">
            <option value="">كل الحالات</option>
            <option value="pending">معلق</option>
            <option value="approved">تم الشحن</option>
            <option value="rejected">مرفوض</option>
          </select>
          <button onClick={() => load()} className="px-4 py-2 bg-everest-600 text-white rounded-lg text-sm">بحث</button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
              <th className="p-3 text-right">الطلب</th>
              <th className="p-3 text-right">الطالب</th>
              <th className="p-3 text-right">المبلغ</th>
              <th className="p-3 text-right">رقم المحول عليه</th>
              <th className="p-3 text-right">طريقة الدفع</th>
              <th className="p-3 text-right">إثبات الدفع</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">#{r.id?.slice(0,8)}</td>
                <td className="p-3">
                  <p className="font-medium">{r.full_name}</p>
                  <p className="text-xs text-gray-400">{r.email}</p>
                </td>
                <td className="p-3 font-bold text-everest-700">{r.amount} EGP</td>
                <td className="p-3 text-xs">{r.phone_number || "—"}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {r.payment_method || "فودافون كاش"}
                  </span>
                </td>
                <td className="p-3">
                  {r.payment_proof ? (
                    <a href={r.payment_proof} target="_blank" rel="noreferrer">
                      <img src={r.payment_proof} alt="proof" className="w-12 h-12 object-cover rounded border cursor-pointer" />
                    </a>
                  ) : <span className="text-xs text-gray-400">—</span>}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    r.status === "approved" ? "bg-green-100 text-green-700"
                    : r.status === "pending" ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                  }`}>
                    {r.status === "pending" ? "قيد الانتظار" : r.status === "approved" ? "تم الشحن" : "مرفوض"}
                  </span>
                </td>
                <td className="p-3">
                  {r.status === "pending" && (
                    <div className="flex gap-1">
                      <button onClick={() => approve(r.id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">
                        موافقة
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
              <tr><td colSpan="8" className="text-center text-gray-400 py-8">لا توجد طلبات</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
