import React, { useState } from "react";
import { useLang } from "../LangContext";
import AppNavbar from "../components/AppNavbar";

const fields = [
  {
    id: "networking", icon: "fa-network-wired", color: "#818cf8",
    title_ar: "هندسة الشبكات وتأمين السحابة", title_en: "Networking & Cloud Security",
    desc_ar: "تحليل وتصميم وإدارة البنية التحتية السحابية والفيزيائية", desc_en: "Analysis, design and management of cloud and physical infrastructure",
    badge: "NETWORKING & CLOUD",
    students: [
      { rank: 1, name: "خالد عبد الرحمن السالم", sub: "تأمين السحابة المتقدم", grade: "99.2%", xp: "4,820 XP", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150" },
      { rank: 2, name: "أروى محمد البلوشي", sub: "هندسة الشبكات CCNA", grade: "98.5%", xp: "4,550 XP", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150" },
      { rank: 3, name: "مازن وليد الجبالي", sub: "بايثون وأتمتة الشبكات", grade: "97.8%", xp: "4,310 XP", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150" },
    ]
  },
  {
    id: "ai", icon: "fa-brain", color: "#a78bfa",
    title_ar: "الذكاء الاصطناعي وهندسة البيانات", title_en: "AI & Data Engineering",
    desc_ar: "بناء النماذج الذكية التنبؤية والتوليدية وإدارة البيانات الضخمة", desc_en: "Building predictive and generative AI models and managing big data",
    badge: "DATA SCIENCE & AI",
    students: [
      { rank: 1, name: "طارق سليم الهواري", sub: "تعلم الآلة والشبكات العصبية", grade: "99.8%", xp: "5,120 XP", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150" },
      { rank: 2, name: "ندى محمود زكي", sub: "علم وتحليل البيانات الفنية", grade: "98.9%", xp: "4,780 XP", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150" },
      { rank: 3, name: "حمزة طلال القاضي", sub: "بناء النماذج الذكية التوليدية", grade: "97.4%", xp: "4,450 XP", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150&h=150" },
    ]
  },
  {
    id: "web", icon: "fa-code", color: "#34d399",
    title_ar: "هندسة وتطوير الويب المتكامل (MERN)", title_en: "Full-Stack Web Development (MERN)",
    desc_ar: "بناء تطبيقات الواجهات والمنظومات الخلفية وقواعد البيانات", desc_en: "Building frontend apps, backend systems and databases",
    badge: "FULLSTACK WEB DEVELOPMENT",
    students: [
      { rank: 1, name: "سعيد علي الحاتمي", sub: "بناء الباكيند والنظم الموزعة", grade: "99.0%", xp: "4,980 XP", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150" },
      { rank: 2, name: "شهد حسام المرزوق", sub: "تطوير واجهات المستخدم React", grade: "98.1%", xp: "4,620 XP", img: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=150&h=150" },
      { rank: 3, name: "عبدالله مصطفى هلال", sub: "بناء برمجيات الويب الشاملة", grade: "97.6%", xp: "4,380 XP", img: "https://images.unsplash.com/photo-1489980508314-941910ded1f4?auto=format&fit=crop&q=80&w=150&h=150" },
    ]
  },
  {
    id: "cyber", icon: "fa-shield-halved", color: "#fb7185",
    title_ar: "الأمن السيبراني والاختراق الأخلاقي", title_en: "Cyber Security & Ethical Hacking",
    desc_ar: "تأمين الشبكات، فحص الثغرات، والاختبار الاستباقي للأنظمة", desc_en: "Network security, vulnerability scanning and proactive system testing",
    badge: "CYBER SECURITY & PENTESTING",
    students: [
      { rank: 1, name: "منصور وليد الحربي", sub: "فحص الثغرات والأمن السيبراني", grade: "99.5%", xp: "5,340 XP", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150" },
      { rank: 2, name: "جود فهد القحطاني", sub: "حماية واختراق الشبكات", grade: "98.7%", xp: "4,910 XP", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150" },
      { rank: 3, name: "فارس عصام الجندي", sub: "الاستجابة للحوادث الرقمية", grade: "97.2%", xp: "4,500 XP", img: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150&h=150" },
    ]
  }
];

const glowMap = { 1: "0 0 30px rgba(251,191,36,0.25)", 2: "0 0 20px rgba(148,163,184,0.12)", 3: "0 0 20px rgba(217,119,6,0.12)" };
const borderMap = { 1: "rgba(251,191,36,0.45)", 2: "rgba(148,163,184,0.3)", 3: "rgba(217,119,6,0.3)" };

function StudentCard({ s }) {
  const [celebrated, setCelebrated] = useState(false);
  const initials = s.name.split(" ").map(w => w[0]).join("").slice(0, 2);
  const rankLabel = { 1: "الأول على الدفعة (ذهبي)", 2: "المركز الثاني (فضي)", 3: "المركز الثالث (برونزي)" };
  return (
    <div style={{
      background: "rgba(15,6,36,0.6)", backdropFilter: "blur(14px)",
      border: `1px solid ${borderMap[s.rank]}`,
      borderRadius: 16, padding: 20, minWidth: 290, flex: "1 1 0",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      height: 180, transition: "0.35s", position: "relative",
      boxShadow: glowMap[s.rank],
    }}>
      <span style={{ position: "absolute", top: 14, left: 14, fontSize: s.rank === 1 ? 20 : 12, color: s.rank === 1 ? "#fbbf24" : s.rank === 2 ? "#94a3b8" : "#d97706" }}>
        {s.rank === 1 ? <i className="fa-solid fa-crown" style={{filter:"drop-shadow(0 2px 5px rgba(251,191,36,0.3))"}}></i> : `#${s.rank}`}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 12,
          background: s.rank === 1 ? "linear-gradient(135deg,#fbbf24,#fef3c7)" : s.rank === 2 ? "linear-gradient(135deg,#94a3b8,#e2e8f0)" : "linear-gradient(135deg,#92400e,#d97706)",
          padding: 1.5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
          <img src={s.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:10}}
            onError={(e) => { e.target.style.display = "none"; e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;background:#0f0824;border-radius:10px;display:flex;align-items:center;justify-content:center;color:${s.rank===1?"#fbbf24":s.rank===2?"#94a3b8":"#d97706"};font-weight:800;font-size:13px">${initials}</div>`; }}
          />
        </div>
        <div>
          <span style={{fontSize:8,fontWeight:800,color:s.rank===1?"#fbbf24":s.rank===2?"#94a3b8":"#d97706",textTransform:"uppercase",letterSpacing:1}}>{rankLabel[s.rank]}</span>
          <h3 style={{fontSize:13,fontWeight:700,color:"#fff",marginTop:2}}>{s.name}</h3>
          <p style={{fontSize:9,color:"#94a3b8",marginTop:2}}>{s.sub}</p>
        </div>
      </div>
      <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid rgba(124,58,237,0.15)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:10,color:"#94a3b8"}}>الدرجة النهائية: <strong style={{color:"#34d399",fontSize:12}}>{s.grade}</strong></span>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:"#fbbf24",fontWeight:700,fontSize:12}}>{s.xp}</span>
          <button onClick={() => setCelebrated(true)}
            style={{padding:"4px 10px",borderRadius:8,border:"1px solid rgba(251,191,36,0.2)",background:celebrated?"rgba(16,185,129,0.2)":"rgba(251,191,36,0.1)",color:celebrated?"#34d399":"#fbbf24",fontSize:9,fontWeight:700,cursor:"pointer",transition:"0.2s"}}>
            {celebrated ? "تم التهنئة! 💖" : "هنئ الفائز 🎉"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TopSallerPage() {
  const { t, dir } = useLang();
  const [search, setSearch] = useState("");

  const filtered = fields.map(f => ({
    ...f,
    students: f.students.filter(s => search === "" || s.name.includes(search))
  })).filter(f => f.students.length > 0 || search === "");

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #090127 0%, #1e0f4e 60%, #e74edb 100%)",
      direction: dir,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      position: "relative", overflowX: "hidden"
    }}>
      <AppNavbar />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "120px 20px 40px", position: "relative", zIndex: 10 }}>
        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label_ar: "الطلاب المتنافسين", label_en: "Competing Students", value: "12,450 طالب", icon: "fa-users-viewfinder", color: "#818cf8" },
            { label_ar: "التقييم الأعلى مسجل", label_en: "Highest Recorded Score", value: "99.8% (رقم قياسي)", icon: "fa-star-half-stroke", color: "#fbbf24" },
            { label_ar: "التحديث التلقائي القادم", label_en: "Next Auto Update", value: "14 ساعة و 32 دقيقة", icon: "fa-rotate", color: "#fb7185", spin: true },
            { label_ar: "ابحث عن طالب", label_en: "Search Student", search: true, color: "#a78bfa" },
          ].map((stat, i) => (
            <div key={i} style={{
              background: "rgba(15,6,36,0.6)", backdropFilter: "blur(14px)",
              border: "1px solid rgba(168,85,247,0.15)", borderRadius: 16, padding: 16,
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              {stat.search ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                  <i className="fa-solid fa-magnifying-glass" style={{color:"#a78bfa",fontSize:12}}></i>
                  <input type="text" placeholder={t("ابحث عن اسم طالب...", "Search student name...")} value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{width:"100%",background:"transparent",border:"none",color:"#fff",fontSize:12,outline:"none"}}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <span style={{fontSize:10,color:"#94a3b8",display:"block",marginBottom:2,fontWeight:600}}>{t(stat.label_ar, stat.label_en)}</span>
                    <p style={{fontSize:18,fontWeight:700,color: stat.color === "#fbbf24" ? "#fbbf24" : "#fff"}}>{stat.value}</p>
                  </div>
                  <div style={{width:40,height:40,borderRadius:12,background:`${stat.color}15`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${stat.color}20`}}>
                    <i className={`fa-solid ${stat.icon}`} style={{color:stat.color,fontSize:14,animation: stat.spin ? "spin 8s linear infinite" : "none"}}></i>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Fields */}
        {filtered.map((field, fi) => (
          <div key={field.id} style={{ marginBottom: 24, animation: `fadeInUp 0.6s ease ${fi * 0.05}s both` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(124,58,237,0.25)", paddingBottom: 8, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{width:32,height:32,borderRadius:10,background:`${field.color}15`,border:`1px solid ${field.color}20`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <i className={`fa-solid ${field.icon}`} style={{color:field.color,fontSize:14}}></i>
                </div>
                <div>
                  <h2 style={{fontSize:16,fontWeight:700,color:"#fff"}}>{t(field.title_ar, field.title_en)}</h2>
                  <p style={{fontSize:9,color:"#94a3b8",marginTop:1}}>{t(field.desc_ar, field.desc_en)}</p>
                </div>
              </div>
              <span style={{fontSize:10,color:"#64748b",display:"none"}}>{field.badge}</span>
            </div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16, scrollbarWidth: "none" }}>
              {field.students.map((s, i) => <StudentCard key={i} s={s} />)}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
