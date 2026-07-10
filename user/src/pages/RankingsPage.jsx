import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useLang } from "../LangContext";
import { api } from "../App";
import AppNavbar from "../components/AppNavbar";

const rankIcons = [
  "⭐", "🚀", "💎", "🏆", "🌍", "⚡", "🔱", "🔥", "🌟", "👑"
];

export default function RankingsPage() {
  const { t, dir } = useLang();
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [leaderboard, setLeaderboard] = useState([]);
  const [allLeaderboard, setAllLeaderboard] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [tab, setTab] = useState("ranks");

  useEffect(() => {
    api("/api/mlm/leaderboard").then(setLeaderboard).catch(() => {});
    api("/api/mlm/leaderboard/all").then(setAllLeaderboard).catch(() => {});
    api("/api/ranks").then((d) => Array.isArray(d) ? setRanks(d) : setRanks([])).catch(() => {});
  }, []);

  const userRankIndex = ranks.findIndex(r => r.name === user?.rank);
  const effectiveIndex = userRankIndex >= 0 ? userRankIndex : 0;
  const nextRank = ranks[effectiveIndex + 1] || null;
  const currentRankData = ranks[effectiveIndex];
  const progressTarget = userRankIndex >= 0 ? ranks[userRankIndex + 1] : ranks.find(r => r.min_direct > 0);
  const progressToNext = progressTarget ? ((user?.total_team_sales || 0) / progressTarget.min_direct) * 100 : 100;

  return (
    <div style={{direction: dir }}>
      <AppNavbar />

      {/* Hero */}
      <section className="rank-hero">
        <div className="rank-hero-content">
          <span className="rank-hero-badge">👋 {t("مرحباً بعودتك", "Welcome Back")}</span>
          <h1>{t("ترتيبك:", "Your Rank:")} <span>{userRankIndex >= 0 ? <>{rankIcons[userRankIndex]} {user?.rank} <span style={{fontSize:16,color:"#888"}}>#{userRankIndex + 1}/{ranks.length}</span></> : "⭐ Star"}</span></h1>
          <p>{t("أكمل المهام، وافتح ترتبات جديدة، وكن أحد قادة أكاديمية إيفرست.", "Complete missions, unlock new ranks, and become one of Everest Academy leaders.")}</p>
          <div className="rank-hero-btns">
            <Link to="/profile" className="rank-btn-primary">
              {t("حسابي", "My Profile")} <span>→</span>
            </Link>
          </div>
          {progressTarget && (
            <div style={{marginTop:20,background:"rgba(255,255,255,.06)",borderRadius:16,padding:"16px 20px",maxWidth:400}}>
              <p style={{fontSize:13,color:"#aaa",marginBottom:6}}>{userRankIndex >= 0 ? t("الترتيب التالي:", "Next Rank:") : t("أول ترتيب:", "First Rank:")} <strong style={{color:"#fff"}}>{progressTarget.name}</strong> · {user?.total_team_sales || 0}/{progressTarget.min_direct} {t("مبيعات الفريق", "Team Sales")}</p>
              <div style={{height:6,background:"rgba(255,255,255,.1)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min(progressToNext,100)}%`,background:"#d4af37",borderRadius:3,transition:"width .5s"}}></div>
              </div>
            </div>
          )}
        </div>
        <div className="rank-hero-img">
          <div style={{width:"100%",maxWidth:400,height:300,background:"#2a2a2a",borderRadius:30,display:"flex",alignItems:"center",justifyContent:"center",fontSize:80,color:"#444"}}>🏆</div>
        </div>
      </section>

      {/* Tabs */}
      <div className="dash-container" style={{marginTop:30,maxWidth:1100,margin:"30px auto",padding:"0 20px"}}>
        <div style={{display:"flex",gap:10,marginBottom:25,justifyContent:"center"}}>
          {["ranks","leaderboard"].map((tb) => (
            <button key={tb} onClick={() => setTab(tb)}
              style={{padding:"10px 28px",borderRadius:14,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,background:tab===tb?"#111":"#f0f0f0",color:tab===tb?"#d4af37":"#555",transition:".3s"}}
            >{tb === "ranks" ? `📊 ${t("جميع الترتبات", "All Ranks")}` : `🏆 ${t("لوحة المتصدرين", "Leaderboard")}`}</button>
          ))}
        </div>

        {tab === "ranks" && (
          <div style={{display:"grid",gap:12}}>
            {ranks.map((r, i) => {
              const hasValidRank = userRankIndex >= 0;
              const isCurrent = hasValidRank && i === userRankIndex;
              const isNext = !hasValidRank && i === 0;
              const isUnlocked = hasValidRank && i < userRankIndex;
              return (
                <div key={r.id} style={{
                  display:"flex",alignItems:"center",justifyContent:"space-between",
                  background:isCurrent ? "rgba(212,175,55,.08)" : "#fff",
                  border:isCurrent ? "2px solid #d4af37" : "1px solid #eee",
                  borderRadius:16,padding:"16px 20px",transition:".3s"
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:16}}>
                    <span style={{fontSize:36}}>{rankIcons[i] || "🏅"}</span>
                    <div>
                      <h3 style={{fontSize:16,fontWeight:700,margin:0}}>{r.name}</h3>
                      <p style={{fontSize:13,color:"#888",marginTop:4}}>
                        {r.min_direct === 0 ? t("انضم وفعّل", "Join & activate") : `${r.min_direct}+ ${t("مبيعات الفريق", "Team Sales")}`}
                        {r.weekly_bonus > 0 && ` · 🎁 ${r.weekly_bonus} EM ${t("مكافأة", "bonus")}`}
                      </p>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    {isCurrent && <span style={{fontSize:12,fontWeight:700,color:"#d4af37"}}>▼ {t("الحالي", "CURRENT")}</span>}
                    {isNext && <span style={{fontSize:12,fontWeight:700,color:"#d4af37"}}>▼ {t("التالي", "NEXT")}</span>}
                    {!isCurrent && !isNext && isUnlocked && <span style={{fontSize:12,fontWeight:600,color:"#22c55e"}}>✓ {t("مفتح", "Unlocked")}</span>}
                    {!isCurrent && !isNext && !isUnlocked && <span style={{fontSize:12,color:"#aaa"}}>🔒 {t("مقفل", "Locked")}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "leaderboard" && (
          <div style={{background:"#fff",borderRadius:20,padding:24,boxShadow:"0 5px 30px rgba(0,0,0,.04)"}}>
            <h3 style={{marginBottom:20,fontSize:20}}>🏆 {t("أبرز المتميزين", "Top Achievers")}</h3>
            {allLeaderboard.length === 0 ? (
              <p style={{color:"#888",textAlign:"center",padding:30}}>{t("لا يوجد أعضاء بعد", "No members yet")}</p>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {allLeaderboard.map((u, i) => (
                  <div key={u.id} style={{
                    display:"flex",alignItems:"center",justifyContent:"space-between",
                    background:i < 3 ? "rgba(212,175,55,.06)" : "#fafafa",
                    borderRadius:14,padding:"12px 16px"
                  }}>
                    <div style={{display:"flex",alignItems:"center",gap:14}}>
                      <span style={{fontSize:18,fontWeight:800,color:i < 3 ? "#d4af37" : "#aaa",width:30}}>#{i + 1}</span>
                      <div style={{width:40,height:40,borderRadius:"50%",background:"#eee",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,overflow:"hidden"}}>
                        {u.avatar && u.avatar.trim() ? <img src={u.avatar} style={{width:"100%",height:"100%",objectFit:"cover"}} /> : <span style={{fontSize:18,fontWeight:800,color:"#d4af37",lineHeight:1}}>{(u.full_name || "U")[0].toUpperCase()}</span>}
                      </div>
                      <div>
                        <p style={{fontWeight:600}}>{u.full_name}{u.id === user?.id && <span style={{fontSize:11,color:"#d4af37",marginLeft:6}}>({t("أنت", "You")})</span>}</p>
                        <p style={{fontSize:12,color:"#888"}}>{u.rank} · {u.total_team_sales || 0} {t("مبيعات الفريق", "Team Sales")}</p>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <p style={{fontWeight:700,color:"#d4af37"}}>{u.e_money} EM</p>
                      {u.weekly_bonus > 0 && <p style={{fontSize:11,color:"#888"}}>🎁 {u.weekly_bonus} EM</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="rank-footer">
        <div className="footer-help">
          <p>{t("هل تحتاج مساعدة؟", "Need Help?")} {t("زر", "Visit our")} <a href="#">{t("قسم المساعدة", "Help Section")}</a></p>
        </div>
        <div className="footer-top">
          <div className="footer-social">
            {["instagram","x-twitter","paper-plane","youtube","linkedin-in","facebook-f"].map((s) => (
              <a key={s} href="#"><i className={`fa-brands fa-${s}`} style={{fontStyle:"normal"}}>◉</i></a>
            ))}
          </div>
          <div className="footer-brand">
            <span>{t("أكاديمية إيفرست 2026", "Everest Academy 2026")}</span>
            <h3>E</h3>
          </div>
        </div>
        <div className="footer-contact">
          {t("طرق للتواصل معنا:", "More ways to reach us:")} <span>+44 (0) 20 7776 9720 (24/5)</span>
        </div>
        <div className="footer-bottom">
          <div className="footer-item">{t("أكاديمية إيفرست لا تقدم خدمات ل residents...", "Everest Academy doesn't offer services to residents...")}</div>
          <div className="footer-item">{t("أكاديمية إيفرست هي علامة تجارية مسجلة...", "Everest Academy is a registered trademark utilised under...")}</div>
        </div>
      </footer>
    </div>
  );
}
