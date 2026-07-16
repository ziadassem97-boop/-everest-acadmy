import React, { useState, useEffect } from "react";
import { useLang } from "../LangContext";
import { api } from "../api.js";

export default function LeadersPage() {
  const { lang, t: tFn } = useLang();
  const t = (ar, en) => tFn(ar, en);
  const [leaders, setLeaders] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchLeaders(); }, []);

  const fetchLeaders = () => api("/api/leaders").then(setLeaders).catch(() => {});

  const refresh = async () => {
    setLoading(true);
    try {
      await api("/api/leaders/refresh", { method: "POST" });
      await fetchLeaders();
    } catch (e) { alert(e.message); }
    setLoading(false);
  };

  const addLeader = async () => {
    if (!userId.trim()) return;
    try {
      const res = await api("/api/leaders/add", { method: "POST", body: JSON.stringify({ userId: userId.trim() }) });
      if (res.error) return alert(res.error);
      setUserId("");
      fetchLeaders();
    } catch (e) { alert(e.message); }
  };

  const removeLeader = async (id) => {
    if (!confirm(t("إزالة هذا القائد؟", "Remove this leader?"))) return;
    try {
      await api(`/api/leaders/${id}`, { method: "DELETE" });
      fetchLeaders();
    } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t("🏆 إدارة القادة", "🏆 Leaders Management")} (Our Leaders)</h2>
      <p className="text-gray-500 text-sm mb-4">{t("أعلى 10 أعضاء — يتم تحديثهم تلقائياً كل أسبوع. يمكنك الإضافة أو الحذف يدوياً (الحد الأقصى 10).", "Top 10 members — auto-updated weekly. You can add or remove manually (max 10).")}</p>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex gap-2 flex-1 min-w-[280px]">
          <input placeholder={t("معرف المستخدم (UUID)", "User ID (UUID)")} value={userId} onChange={(e) => setUserId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLeader()}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-everest-500 flex-1" />
          <button onClick={addLeader} disabled={leaders.length >= 10}
            className="px-5 py-2.5 bg-everest-600 text-white rounded-xl font-medium text-sm hover:bg-everest-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
            ➕ {t("اضافة", "Add")}
          </button>
        </div>
        <button onClick={refresh} disabled={loading}
          className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition disabled:opacity-50">
          {loading ? t("جاري...", "...Loading") : "🔄 " + t("تحديث تلقائي", "Auto Refresh")}
        </button>
      </div>

      {leaders.length >= 10 && (
        <p className="text-xs text-orange-500 mb-4">⚠️ {t("الحد الأقصى 10 أعضاء — أزل عضو أولاً قبل الإضافة", "Max 10 members — remove one before adding")}</p>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold">🏆 {t("أعلى الرتب", "Top Ranks")} ({leaders.length}/10)</h3>
        </div>
        {leaders.length === 0 ? (
          <p className="p-8 text-gray-400 text-center">{t("لا يوجد أعضاء برتب بعد", "No ranked members yet")}</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {leaders.map((l, i) => (
              <div key={l.id || i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-gray-300 w-6">#{i + 1}</span>
                  <span className="text-2xl">{l.icon || "🏆"}</span>
                  {l.avatar ? (
                    <img src={l.avatar} alt="" className="w-12 h-12 rounded-xl object-cover bg-gray-100" onError={(e) => { e.target.style.display = "none" }} />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-everest-400 to-everest-600 flex items-center justify-center text-white font-bold text-lg">
                      {(l.name || "?")[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">{l.name}</p>
                    <p className="text-sm text-gray-500">{l.icon || "🏆"} {l.rank}</p>
                  </div>
                </div>
                <button onClick={() => removeLeader(l.id)}
                  className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                  🗑️ {t("ازالة", "Remove")}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
