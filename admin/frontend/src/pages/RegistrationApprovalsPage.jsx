import React, { useState, useEffect } from "react";

const api = async (path, opts = {}) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error("Server returned HTML (backend may be down). Check that the server is running on port 5000."); }
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

export default function RegistrationApprovalsPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api("/api/users/pending-registrations")
      .then(setPending)
      .catch((e) => alert(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (userId) => {
    try {
      await api(`/api/users/${userId}/approve-registration`, { method: "PUT" });
      load();
    } catch (e) { alert(e.message); }
  };

  const handleReject = async (userId) => {
    try {
      await api(`/api/users/${userId}/reject-registration`, { method: "PUT" });
      load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">🔐 تفعيل الحسابات الجديدة</h2>
        <span className="text-sm text-gray-400 bg-white px-3 py-1.5 rounded-lg border">
          {pending.length} {pending.length === 1 ? "مستخدم" : "مستخدمين"} بانتظار التفعيل
        </span>
      </div>

      {loading ? (
        <p className="text-gray-500">جارٍ التحميل...</p>
      ) : pending.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-gray-500 text-lg">لا يوجد مستخدمين بانتظار التفعيل</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full table-data">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                <th>الاسم</th>
                <th>البريد</th>
                <th>رقم الهاتف</th>
                <th>تاريخ التسجيل</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pending.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="font-medium">{u.full_name}</td>
                  <td className="text-gray-500 text-xs">{u.email}</td>
                  <td className="text-gray-500 text-xs">{u.phone || "—"}</td>
                  <td className="text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString("ar-EG")}</td>
                  <td className="text-left">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleApprove(u.id)}
                        className="px-4 py-1.5 text-xs font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      >
                        ✅ تفعيل
                      </button>
                      <button
                        onClick={() => handleReject(u.id)}
                        className="px-4 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        ❌ رفض
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
