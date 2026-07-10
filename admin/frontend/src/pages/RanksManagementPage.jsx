import React, { useState, useEffect } from "react";

const api = (path, opts = {}) =>
  fetch(path, { headers: { "Content-Type": "application/json" }, ...opts }).then((r) => r.json());

export default function RanksManagementPage() {
  const [ranks, setRanks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", min_direct: 0, weekly_bonus: 0, is_active: 1 });

  const load = () => api("/api/ranks?all=true").then(setRanks);
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: "", min_direct: 0, weekly_bonus: 0, is_active: 1 });
    setShowForm(true);
  };

  const openEdit = (r) => {
    setEditItem(r);
    setForm({ name: r.name, min_direct: r.min_direct, weekly_bonus: r.weekly_bonus, is_active: r.is_active });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    if (editItem) {
      await api(`/api/ranks/${editItem.id}`, { method: "PUT", body: JSON.stringify(form) });
    } else {
      await api("/api/ranks", { method: "POST", body: JSON.stringify(form) });
    }
    setShowForm(false); setEditItem(null); load();
  };

  const toggleActive = async (r) => {
    await api(`/api/ranks/${r.id}`, { method: "PUT", body: JSON.stringify({ is_active: r.is_active ? 0 : 1 }) });
    load();
  };

  const remove = async (id, name) => {
    if (!confirm(`هل أنت متأكد من حذف رتبة "${name}"؟`)) return;
    await api(`/api/ranks/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">🏅 إدارة الرتب</h2>
          <p className="text-gray-500 text-sm mt-1">إضافة، تعديل، إخفاء، أو حذف الرتب — الرتب النشطة فقط تظهر للمستخدمين</p>
        </div>
        <button onClick={openAdd} className="px-5 py-2.5 bg-everest-600 text-white rounded-xl font-medium text-sm hover:bg-everest-700 transition flex items-center gap-2 shadow-sm">
          <span>+</span> إضافة رتبة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "إجمالي الرتب", value: ranks.length, icon: "🏅", color: "#6366f1" },
          { label: "رتب نشطة", value: ranks.filter(r => r.is_active).length, icon: "✅", color: "#10b981" },
          { label: "رتب معطلة", value: ranks.filter(r => !r.is_active).length, icon: "🚫", color: "#ef4444" },
          { label: "أعلى مكافأة", value: Math.max(...ranks.map(r => r.weekly_bonus), 0), icon: "🎁", color: "#f59e0b", suffix: " EM" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: s.color + "15" }}>{s.icon}</div>
            <div>
              <p className="text-gray-400 text-xs">{s.label}</p>
              <p className="text-2xl font-extrabold text-gray-900">{s.value}{s.suffix || ""}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rank Cards */}
      {ranks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-5xl mb-4">🏅</p>
          <p className="text-gray-400 font-medium">لا توجد رتب مضافة بعد</p>
          <p className="text-gray-300 text-sm mt-1">أضف الرتبة الأولى الآن</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ranks.map((r, i) => (
            <div key={r.id} className={`bg-white rounded-xl shadow-sm border transition hover:shadow-md ${r.is_active ? "border-gray-100" : "border-red-200 bg-red-50/30"}`}>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold" style={{ background: r.is_active ? "#fef3c7" : "#f3f4f6", color: r.is_active ? "#d97706" : "#9ca3af" }}>
                      #{i + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className={`text-lg font-bold ${r.is_active ? "text-gray-900" : "text-gray-400"}`}>{r.name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${r.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {r.is_active ? "نشط" : "معطل"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span className="text-gray-500">🎯 <strong>{r.min_direct}</strong> {r.min_direct === 0 ? "(بدون شرط)" : "Team Sales"}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500">🎁 <strong>{r.weekly_bonus.toLocaleString()}</strong> {r.weekly_bonus > 0 ? "EM" : "(بدون)"}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500">📊 الترتيب: <strong>{r.sort_order}</strong></span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500">👥 المستخدمون: <strong>{r.user_count || 0}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${r.is_active ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                      {r.is_active ? "🔴 تعطيل" : "🟢 تفعيل"}
                    </button>
                    <button onClick={() => openEdit(r)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100">✏️ تعديل</button>
                    <button onClick={() => remove(r.id, r.name)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100">🗑️ حذف</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">{editItem ? "تعديل الرتبة" : "إضافة رتبة جديدة"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">اسم الرتبة</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: Everest Elite"
                  className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-everest-500 focus:border-everest-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">عدد Team Sales المطلوب</label>
                  <input type="number" min="0" value={form.min_direct} onChange={(e) => setForm({ ...form, min_direct: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-everest-500 focus:border-everest-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">المكافأة (E-Money)</label>
                  <input type="number" min="0" value={form.weekly_bonus} onChange={(e) => setForm({ ...form, weekly_bonus: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-everest-500 focus:border-everest-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الحالة</label>
                <div className="flex gap-3">
                  {[
                    { val: 1, label: "🟢 نشط", desc: "تظهر للمستخدمين" },
                    { val: 0, label: "🔴 معطل", desc: "مخفية عن المستخدمين" },
                  ].map((opt) => (
                    <button key={opt.val} onClick={() => setForm({ ...form, is_active: opt.val })}
                      className={`flex-1 p-3 rounded-xl border-2 text-center transition ${form.is_active === opt.val ? "border-everest-500 bg-everest-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <span className="text-sm font-medium block">{opt.label}</span>
                      <span className="text-xs text-gray-400">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl font-medium text-sm">إلغاء</button>
              <button onClick={save} className="flex-1 px-4 py-2.5 bg-everest-600 text-white rounded-xl font-medium text-sm hover:bg-everest-700 transition">
                {editItem ? "حفظ التعديلات" : "إضافة رتبة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
