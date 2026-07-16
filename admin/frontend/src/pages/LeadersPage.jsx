import React, { useState, useEffect } from "react";
import { useLang } from "../LangContext";
import { api } from "../api.js";

export default function LeadersPage() {
  const { lang, t: tFn } = useLang();
  const t = (ar, en) => tFn(ar, en);
  const [leaders, setLeaders] = useState([]);

  useEffect(() => { fetchLeaders(); }, []);

  const fetchLeaders = () => api("/api/leaders?top=1").then(setLeaders);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t("🏆 إدارة القادة", "🏆 Leaders Management")} (Our Leaders)</h2>
      <p className="text-gray-500 text-sm mb-4">{t("أعلى 10 أعضاء حسب الرتبة والمبيعات — يتم تحديثها تلقائياً أسبوعياً.", "Top 10 members by rank and sales — auto-updated weekly.")}</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold">🏆 {t("أعلى الرتب", "Top Ranks")} ({leaders.length})</h3>
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
                    <p className="text-xs text-gray-400">{l.direct_count} directs · E-Money {l.e_money?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
