import React, { useState, useEffect, useRef } from "react";

const api = (path, opts = {}) =>
  fetch(path, { headers: { "Content-Type": "application/json" }, ...opts }).then((r) => r.json());

export default function LeadersPage() {
  const [leaders, setLeaders] = useState([]);
  const [form, setForm] = useState({ name: "", rank: "", avatar: "", icon: "🏆" });
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { fetchLeaders(); }, []);

  const fetchLeaders = () => api("/api/leaders").then(setLeaders);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setForm({ ...form, avatar: url });
    } catch (err) { alert("فشل رفع الصورة: " + err.message); }
    setUploading(false);
  };

  const save = async () => {
    if (!form.name || !form.rank) return alert("Name and rank required");
    if (editing) {
      await api(`/api/leaders/${editing}`, { method: "PUT", body: JSON.stringify(form) });
    } else {
      await api("/api/leaders", { method: "POST", body: JSON.stringify(form) });
    }
    setForm({ name: "", rank: "", avatar: "", icon: "🏆" });
    setEditing(null);
    fetchLeaders();
  };

  const edit = (l) => { setForm({ name: l.name, rank: l.rank, avatar: l.avatar || "", icon: l.icon || "🏆" }); setEditing(l.id); };
  const remove = async (id) => { if (confirm("Delete this leader?")) { await api(`/api/leaders/${id}`, { method: "DELETE" }); fetchLeaders(); } };
  const cancel = () => { setForm({ name: "", rank: "", avatar: "", icon: "🏆" }); setEditing(null); };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🏆 إدارة القادة (Our Leaders)</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-bold text-lg mb-4">{editing ? "✏️ تعديل قائد" : "➕ إضافة قائد جديد"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input placeholder="الاسم" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-everest-500" />
          <input placeholder="الرتبة (مثل: Everest Ambassador)" value={form.rank} onChange={(e) => setForm({...form, rank: e.target.value})}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-everest-500" />
          <div className="flex items-center gap-3">
            <button onClick={() => fileRef.current?.click()} className="px-4 py-2.5 bg-gray-100 rounded-xl text-sm hover:bg-gray-200 transition border border-gray-200">
              {uploading ? "جاري الرفع..." : (form.avatar ? "🖼️ تغيير الصورة" : "📸 رفع صورة")}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleUpload} disabled={uploading} />
            {form.avatar && <img src={form.avatar} alt="" className="w-10 h-10 rounded-lg object-cover" />}
          </div>
          <input placeholder="الأيقونة (مثل: 🌟)" value={form.icon} onChange={(e) => setForm({...form, icon: e.target.value})}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-everest-500" />
        </div>
        <div className="flex gap-3">
          <button onClick={save} className="px-6 py-2.5 bg-everest-600 text-white rounded-xl font-medium text-sm hover:bg-everest-700 transition">
            {editing ? "💾 حفظ التعديلات" : "➕ إضافة"}
          </button>
          {editing && <button onClick={cancel} className="px-6 py-2.5 bg-gray-100 rounded-xl font-medium text-sm hover:bg-gray-200 transition">إلغاء</button>}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold">📋 القادة الحاليون ({leaders.length})</h3>
        </div>
        {leaders.length === 0 ? (
          <p className="p-8 text-gray-400 text-center">لا يوجد قادة بعد</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {leaders.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{l.icon || "🏆"}</span>
                  <img src={l.avatar || ""} alt="" className="w-12 h-12 rounded-xl object-cover bg-gray-100" onError={(e) => { e.target.style.display = "none" }} />
                  <div>
                    <p className="font-semibold text-gray-800">{l.name}</p>
                    <p className="text-sm text-gray-500">{l.rank}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => edit(l)} className="px-4 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">✏️</button>
                  <button onClick={() => remove(l.id)} className="px-4 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
