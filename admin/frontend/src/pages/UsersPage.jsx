import React, { useState, useEffect } from "react";

const api = async (path, opts = {}) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error("Server returned HTML (backend may be down). Check that the server is running on port 5000."); }
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [teamTab, setTeamTab] = useState(1);
  const [amount, setAmount] = useState("");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadUsers = () => api("/api/users").then(setUsers);
  useEffect(() => { loadUsers(); }, []);

  const openProfile = (user) => {
    api(`/api/users/${user.id}`).then((data) => {
      setSelectedUser(data);
      setTeamTab(1);
      setAmount("");
    });
  };

  const processEMoney = async () => {
    if (!amount || !selectedUser) return;
    try {
      await api(`/api/users/${selectedUser.id}/e-money`, {
        method: "PUT", body: JSON.stringify({ amount: parseFloat(amount), allow_negative: true }),
      });
      const updated = await api(`/api/users/${selectedUser.id}`);
      setSelectedUser(updated);
      setAmount("");
      loadUsers();
    } catch (e) { alert("خطأ: " + e.message); }
  };

  const toggleBlock = async (user) => {
    if (user.blocked) {
      await api(`/api/users/${user.id}/unblock`, { method: "PUT" });
    } else {
      await api(`/api/users/${user.id}/block`, { method: "PUT" });
    }
    loadUsers();
    if (selectedUser?.id === user.id) {
      const updated = await api(`/api/users/${user.id}`);
      setSelectedUser(updated);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await api(`/api/users/${userId}`, { method: "DELETE" });
      setConfirmDelete(null);
      if (selectedUser?.id === userId) setSelectedUser(null);
      loadUsers();
    } catch (e) {
      alert("خطأ في حذف المستخدم: " + (e.message || "حدث خطأ"));
    }
  };

  const filtered = users.filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">👤 إدارة المستخدمين</h2>
        <span className="text-sm text-gray-400 bg-white px-3 py-1.5 rounded-lg border">{users.length} مستخدم</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-4">
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن مستخدم..."
            className="w-full max-w-md px-4 py-2 border rounded-lg text-sm"
          />
        </div>
        <table className="w-full table-data">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
              <th>الاسم</th>
              <th>البريد</th>
              <th>الدور</th>
              <th>الرتبة</th>
              <th>الرصيد</th>
              <th>الحالة</th>
              <th>التفعيل</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="font-medium">{u.full_name}</td>
                <td className="text-gray-500 text-xs">{u.email}</td>
                <td>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role === "admin" ? "bg-purple-100 text-purple-700" :
                    u.role === "student" ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{u.role}</span>
                </td>
                <td>{u.rank}</td>
                <td className="text-everest-600 font-bold">{u.e_money}</td>
                <td>
                  {u.blocked ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">محظور</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">نشط</span>
                  )}
                </td>
                <td>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.status === "active" ? "bg-green-100 text-green-700" :
                    u.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    u.status === "rejected" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {u.status === "active" ? "مفعل" : u.status === "pending" ? "قيد المراجعة" : u.status === "rejected" ? "مرفوض" : "—"}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openProfile(u)} className="text-blue-600 hover:underline text-sm">عرض</button>
                    <button onClick={() => toggleBlock(u)} className={`text-sm hover:underline ${u.blocked ? "text-green-600" : "text-orange-600"}`}>
                      {u.blocked ? "فك الحظر" : "حظر"}
                    </button>
                    {u.role !== "admin" && (
                      <button onClick={() => setConfirmDelete(u)} className="text-red-600 hover:underline text-sm">حذف</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-4xl mb-4">⚠️</p>
            <h3 className="text-lg font-bold mb-2">حذف المستخدم</h3>
            <p className="text-gray-500 text-sm mb-6">هل أنت متأكد من حذف <strong>{confirmDelete.full_name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmDelete(null)} className="px-6 py-2 bg-gray-100 rounded-lg font-medium text-sm">إلغاء</button>
              <button onClick={() => handleDelete(confirmDelete.id)} className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700">حذف نهائياً</button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">ملف المستخدم</h3>
                <div className="flex items-center gap-3">
                  {selectedUser.blocked && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">محظور</span>}
                  <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "البريد الإلكتروني", value: selectedUser.email },
                  { label: "رقم الهاتف", value: selectedUser.phone || "—" },
                  { label: "العنوان", value: selectedUser.address || "—" },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium mt-1">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-400">كود الإحالة</p>
                  <p className="text-sm font-bold text-purple-600 mt-1">{selectedUser.referral_code}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-400">الرتبة الحالية</p>
                  <p className="text-sm font-bold mt-1">⭐ {selectedUser.rank}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-400">مبيعات الفريق</p>
                  <p className="text-sm font-bold mt-1">{selectedUser.total_team_sales || 0}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-400">رصيد E-Money</p>
                  <p className="text-sm font-bold text-green-600 mt-1">{selectedUser.e_money}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-bold mb-3">💰 إضافة / خصم رصيد</h4>
                <div className="flex gap-3">
                  <input
                    type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    placeholder="مثال: 50 أو -50"
                    className="flex-1 px-4 py-2 border rounded-lg text-sm"
                  />
                  <button onClick={processEMoney} className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700">تنفيذ</button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <button onClick={() => toggleBlock(selectedUser)} className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedUser.blocked ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                  {selectedUser.blocked ? "🔓 فك الحظر" : "🔒 حظر المستخدم"}
                </button>
                <button onClick={async () => {
                  await api(`/api/users/${selectedUser.id}/negative-toggle`, { method: "PUT" });
                  const updated = await api(`/api/users/${selectedUser.id}`);
                  setSelectedUser(updated);
                }} className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedUser.negative_allowed ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"}`}>
                  {selectedUser.negative_allowed ? "✅ السماح بالسالب مفعل" : "⛔ السماح بالسالب"}
                </button>
                {selectedUser.role !== "admin" && (
                  <button onClick={() => { setConfirmDelete(selectedUser); }} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                    🗑️ حذف المستخدم
                  </button>
                )}
              </div>

              <div>
                <h4 className="font-bold mb-3">👥 فريق التسويق</h4>
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3].map((lvl) => (
                    <button key={lvl} onClick={() => setTeamTab(lvl)} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${teamTab === lvl ? "bg-everest-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                      مستوى {lvl}
                    </button>
                  ))}
                </div>
                <table className="w-full table-data border rounded-lg">
                  <thead>
                    <tr className="bg-gray-50"><th>الاسم</th><th>البريد</th><th>الدور</th></tr>
                  </thead>
                  <tbody>
                    {selectedUser.team?.length > 0 ? selectedUser.team.map((m) => (
                      <tr key={m.id} className="border-t">
                        <td className="font-medium">{m.full_name}</td>
                        <td className="text-xs text-gray-500">{m.email}</td>
                        <td><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">{m.role}</span></td>
                      </tr>
                    )) : (
                      <tr><td colSpan="3" className="text-center text-gray-400 py-4">لا يوجد أعضاء</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
