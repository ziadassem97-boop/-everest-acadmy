import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useLang } from "../LangContext";
import { api } from "../App";
import AppNavbar from "../components/AppNavbar";

const img = (name) => `/images/${name}`;

const s = {
  navbar: {
    position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",
    width:"94%",maxWidth:1450,height:78,
    background:"rgba(255,255,255,0.85)",backdropFilter:"blur(18px)",
    border:"1px solid rgba(255,255,255,0.45)",borderRadius:22,
    boxShadow:"0 12px 35px rgba(0,0,0,0.06)",zIndex:999,
    transition:"0.35s ease"
  },
  navContainer: { height:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 30px" },
  logo: { height:90,display:"block",objectFit:"contain" },
  navLinks: { display:"flex",alignItems:"center",gap:34,listStyle:"none",margin:0,padding:0 },
  navLink: { position:"relative",textDecoration:"none",fontSize:15,fontWeight:600,color:"#222",transition:"0.3s",cursor:"pointer" },
  navLinkActive: { color:"#2563ff" },
  navRight: { display:"flex",alignItems:"center",gap:16 },
  notificationBtn: { position:"relative",width:48,height:48,border:"none",outline:"none",cursor:"pointer",borderRadius:14,background:"#f7f7f7",fontSize:18,transition:"0.3s",display:"flex",alignItems:"center",justifyContent:"center" },
  notifDot: { position:"absolute",top:11,right:13,width:8,height:8,background:"#ff3b30",borderRadius:"50%" },
  profileBox: { display:"flex",alignItems:"center",gap:12,padding:"8px 10px",borderRadius:16,cursor:"pointer",transition:"0.3s" },
  profileImg: { width:46,height:46,borderRadius:"50%",objectFit:"cover",background:"#ddd" },
  profileName: { fontSize:15,color:"#111",marginBottom:2 },
  profileRole: { fontSize:12,color:"#888" },
  hamburger: { display:"none",width:46,height:46,borderRadius:14,background:"#f6f6f6",cursor:"pointer",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:5 },
  hamburgerSpan: { width:22,height:2,background:"#222",borderRadius:50,transition:"0.35s" },
  // Hero
  hero: { width:"95%",maxWidth:1500,margin:"0 auto",background:"#151515",borderRadius:0,padding:"55px 60px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:40,overflow:"hidden",position:"relative" },
  heroContent: { flex:1,maxWidth:700 },
  heroBadge: { display:"inline-flex",alignItems:"center",gap:10,padding:"10px 18px",border:"1px solid rgba(255,255,255,0.12)",borderRadius:999,background:"rgba(204,30,30,0.03)",color:"#4f83ff",fontSize:13,fontWeight:600,marginBottom:22 },
  heroH1: { fontSize:56,lineHeight:1.08,letterSpacing:"-1px",marginBottom:20,color:"#2563ff" },
  heroH1Span: { color:"#2563ff" },
  heroP: { fontSize:17,lineHeight:1.8,maxWidth:520,marginBottom:32,color:"#b7b7b7" },
  heroButtons: { display:"flex",gap:14 },
  btnPrimary: { height:52,padding:"0 24px",borderRadius:14,background:"#2563ff",color:"white",textDecoration:"none",display:"flex",alignItems:"center",gap:14,fontSize:15,fontWeight:600,transition:"0.35s",border:"none",cursor:"pointer" },
  heroImage: { flex:1,display:"flex",justifyContent:"flex-end" },
  heroImg: { width:"100%",maxWidth:700,display:"block",borderRadius:30,objectFit:"contain",filter:"drop-shadow(0 30px 60px rgba(0,0,0,0.45))" },
  // Leaders
  leadersSection: { padding:"90px 5%",background:"#0b0b0f",color:"#fff",borderRadius:0 },
  sectionTitle: { textAlign:"center",marginBottom:50 },
  sectionTitleSpan: { color:"#7c7c86",fontSize:"0.75rem",letterSpacing:3 },
  sectionTitleH2: { fontSize:"clamp(2rem,4vw,3.5rem)",margin:"10px 0" },
  sectionTitleP: { color:"#8d8d96",maxWidth:500,margin:"auto" },
  leadersSlider: { display:"flex",gap:18,overflowX:"auto",scrollbarWidth:"none",padding:"20px 0" },
  leaderCard: { flex:"0 0 210px",scrollSnapAlign:"start",background:"#111217",border:"1px solid rgba(255,255,255,0.06)",borderRadius:28,padding:20,textAlign:"center",position:"relative",transition:"0.3s ease" },
  rankIcon: { position:"absolute",top:-15,left:"50%",transform:"translateX(-50%)",width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center",background:"#181920",borderRadius:14,fontSize:20 },
  leaderImg: { width:120,height:120,objectFit:"cover",borderRadius:"30%",marginTop:15,marginBottom:15,background:"#333" },
  leaderName: { fontSize:"0.95rem",fontWeight:600,marginBottom:12 },
  rank: { display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"8px 14px",borderRadius:999,fontSize:"0.72rem",fontWeight:600 },
  // Courses
  courses: { padding:"100px 5%",background:"#f7f6f3",overflow:"hidden" },
  coursesHeader: { maxWidth:650,marginBottom:50 },
  coursesHeaderSpan: { fontSize:"0.75rem",letterSpacing:3,color:"#777",display:"block",marginBottom:12 },
  coursesHeaderH2: { fontSize:"clamp(2.2rem,5vw,4rem)",color:"#111",lineHeight:1.1,marginBottom:15 },
  coursesHeaderH2Span: { position:"relative",color:"#111",display:"inline" },
  coursesHeaderP: { color:"#666",lineHeight:1.8,maxWidth:550 },
  coursesGrid: { display:"flex",gap:20,overflowX:"auto",padding:"10px 0",scrollbarWidth:"none",scrollSnapType:"x mandatory" },
  courseCard: { minWidth:280,maxWidth:280,flexShrink:0,scrollSnapAlign:"start",background:"#fff",borderRadius:26,padding:16,boxShadow:"0 10px 30px rgba(0,0,0,0.05)",transition:"0.35s ease",overflow:"hidden" },
  courseImage: { width:"100%",height:160,objectFit:"cover",borderRadius:18,background:"#eee",display:"block" },
  courseCardH3: { marginTop:15,fontSize:"1.1rem",color:"#111" },
  courseCardP: { marginTop:10,color:"#666",fontSize:"0.88rem",lineHeight:1.7 },
  courseFooter: { marginTop:18,paddingTop:18,borderTop:"1px solid #eee",display:"flex",justifyContent:"space-between",alignItems:"center" },
  priceSmall: { display:"block",color:"#888",fontSize:"0.7rem" },
  priceH4: { fontSize:"1.3rem",color:"#111",marginTop:3 },
  courseBtn: { textDecoration:"none",background:"#111",color:"#fff",padding:"10px 14px",borderRadius:12,fontSize:"0.85rem",transition:"0.3s",display:"inline-flex",alignItems:"center",gap:8 },
  // Rank Guide
  rankGuide: { padding:"10px 5%",background:"#f7f6f3" },
  guideHeader: { maxWidth:550,marginBottom:35 },
  guideHeaderSpan: { display:"block",fontSize:"0.75rem",letterSpacing:3,color:"#888",marginBottom:10 },
  guideHeaderH2: { fontSize:"clamp(1.8rem,4vw,3rem)",lineHeight:1.1,color:"#111",marginBottom:12 },
  guideHeaderP: { color:"#666",lineHeight:1.7 },
  guideWrapper: { background:"#fff",borderRadius:24,overflow:"hidden",boxShadow:"0 10px 30px rgba(0,0,0,0.04)" },
  guideItem: { borderBottom:"1px solid #eee" },
  guideSummary: { listStyle:"none",cursor:"pointer",padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",fontWeight:600,color:"#111" },
  guideContent: { padding:"0 22px 18px" },
  guideContentP: { color:"#666",fontSize:"0.9rem",lineHeight:1.7,margin:"6px 0" },
  guideContentStrong: { color:"#111" },
  // Footer
  footer: { background:"#f5f5f5" },
  footerHelp: { maxWidth:"90%",margin:"auto",background:"#000",color:"#fff",textAlign:"center",padding:22,marginBottom:35 },
  footerHelpA: { color:"#fff",fontWeight:600 },
  footerTop: { width:"90%",margin:"auto",display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:25,borderBottom:"1px solid #e5e5e5" },
  footerSocial: { display:"flex",gap:28 },
  footerSocialA: { fontSize:20,color:"#4b5cff",transition:"0.3s",textDecoration:"none" },
  footerBrand: { display:"flex",alignItems:"center",gap:20,fontSize:20 },
  footerBrandSpan: { fontSize:20,color:"#222" },
  footerBrandH3: { fontSize:"3rem",margin:0,color:"#111" },
  footerContact: { width:"90%",margin:"auto",textAlign:"center",padding:"28px 0",color:"#666",borderBottom:"1px solid #e5e5e5" },
  footerContactSpan: { color:"#333" },
  footerBottom: { background:"#000",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:50,padding:"80px 8%" },
  footerItem: { color:"#9d9d9d",fontSize:"1rem",lineHeight:2 },
  footerItemStrong: { color:"#fff" },
};

const ranks = [
  { icon: "⭐", name: "Star", req: "Join and activate your account.", reward: "Community access & recognition." },
  { icon: "🚀", name: "Executive", req: "5 Team Sales.", reward: "1,500 EGP Bonus." },
  { icon: "💎", name: "Executive Star", req: "10 Team Sales.", reward: "3,000 EGP Bonus." },
  { icon: "🏆", name: "Senior Leader", req: "40 Team Sales.", reward: "8,000 EGP Bonus." },
  { icon: "🌍", name: "Regional Leader", req: "70 Team Sales.", reward: "12,000 EGP Bonus." },
  { icon: "⚡", name: "Everest Elite", req: "120 Team Sales.", reward: "18,000 EGP Bonus." },
  { icon: "🔱", name: "Everest Master", req: "200 Team Sales.", reward: "28,000 EGP Bonus." },
  { icon: "🔥", name: "Everest Legend", req: "350 Team Sales.", reward: "45,000 EGP Bonus." },
  { icon: "🌟", name: "Everest Ambassador", req: "600 Team Sales.", reward: "75,000 EGP Bonus." },
];

const rankClassMap = {
  "Everest Ambassador":"ambassador","Everest Legend":"legend","Everest Master":"master",
  "Everest Elite":"elite","Regional Leader":"regional","Senior Leader":"senior",
  "Executive Star":"elite","Executive":"senior"
};

const rankColors = {
  ambassador: { color:"#ffd700", bg:"rgba(255,215,0,0.08)", border:"1px solid rgba(255,215,0,0.18)" },
  legend: { color:"#ff5b5b", bg:"rgba(255,91,91,0.08)", border:"1px solid rgba(255,91,91,0.18)" },
  master: { color:"#20d4c2", bg:"rgba(32,212,194,0.08)", border:"1px solid rgba(32,212,194,0.18)" },
  elite: { color:"#a855f7", bg:"rgba(168,85,247,0.08)", border:"1px solid rgba(168,85,247,0.18)" },
  regional: { color:"#22c55e", bg:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.18)" },
  senior: { color:"#fb923c", bg:"rgba(251,146,60,0.08)", border:"1px solid rgba(251,146,60,0.18)" },
};

export default function HomePage() {
  const { user, logout } = useAuth();
  const { t, dir } = useLang();
  const nav = useNavigate();
  const loc = useLocation();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSidebar, setChatSidebar] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [conversations, setConversations] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ea_chats")) || []; } catch { return []; }
  });
  const [activeConvId, setActiveConvId] = useState(null);
  const chatRef = useRef(null);

  const activeConv = conversations.find(c => c.id === activeConvId) || null;
  const chatMsgs = activeConv?.messages || [];

  const saveConvs = (convs) => {
    setConversations(convs);
    localStorage.setItem("ea_chats", JSON.stringify(convs));
  };

  const newChat = () => {
    setChatSidebar(false);
    const id = Date.now().toString();
    const conv = { id, title: "محادثة جديدة", messages: [], createdAt: id };
    saveConvs([conv, ...conversations]);
    setActiveConvId(id);
  };

  const deleteChat = (e, id) => {
    e.stopPropagation();
    const convs = conversations.filter(c => c.id !== id);
    saveConvs(convs);
    if (activeConvId === id) setActiveConvId(convs.length > 0 ? convs[0].id : null);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput("");
    let convs = [...conversations];
    let conv = convs.find(c => c.id === activeConvId);
    if (!conv) {
      const id = Date.now().toString();
      conv = { id, title: msg.slice(0, 30), messages: [], createdAt: id };
      convs.unshift(conv);
      setActiveConvId(id);
    }
    if (conv.title === "محادثة جديدة") conv.title = msg.slice(0, 30);
    conv.messages.push({ role: "user", text: msg });
    saveConvs(convs);
    setChatLoading(true);
    try {
      const history = conv.messages.slice(0, -1).map(m => ({ role: m.role === "user" ? "user" : "model", text: m.text }));
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history })
      });
      const data = await res.json();
      convs = JSON.parse(localStorage.getItem("ea_chats")) || [];
      conv = convs.find(c => c.id === activeConvId);
      if (conv) {
        conv.messages.push({ role: "bot", text: data.reply || data.error || "عذراً، حدث خطأ. حاول مرة أخرى." });
        saveConvs(convs);
      }
    } catch {
      convs = JSON.parse(localStorage.getItem("ea_chats")) || [];
      conv = convs.find(c => c.id === activeConvId);
      if (conv) {
        conv.messages.push({ role: "bot", text: "عذراً، حدث خطأ في الاتصال. حاول مرة أخرى." });
        saveConvs(convs);
      }
    }
    setChatLoading(false);
  };

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMsgs]);
  const [openRank, setOpenRank] = useState(0);
  const [courses, setCourses] = useState([]);
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    api("/api/courses?status=published").then(setCourses).catch(() => {});
    api("/api/leaders").then(setLeaders).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); nav("/login"); };

  return (
    <div style={{background:"#f7f6f3",minHeight:"100vh",direction:dir}}>
      <AppNavbar />

      {/* Hero */}
      <section style={{...s.hero,marginBottom:25}}>
        <div style={s.heroContent}>
          <span style={s.heroBadge}>{t("👋 مرحباً بعودتك","👋 Welcome Back")}{user ? `, ${user.full_name?.split(" ")[0]}` : ""}</span>
          <h1 style={s.heroH1}>{t("اكمل","Continue Your")} <br />{t("رحلتك إلى","Journey To The")} <br /><span style={s.heroH1Span}>{t("الرتبة التالية","Next Rank")}</span></h1>
          <p style={s.heroP}>{t("أكمل المهام، افتح رتباً جديدة، تعلم من كورسات احترافية وكن واحداً من قادة أكاديمية إيفرست.","Complete missions, unlock new ranks, learn from premium courses and become one of Everest Academy leaders.")}</p>
          <div style={s.heroButtons}>
            <Link to="/courses" style={s.btnPrimary}>{t("مواصلة التعلم","Continue Learning")} <i className="fa-solid fa-arrow-right"></i></Link>
          </div>
        </div>
        <div style={s.heroImage}>
            <img src={img("Screenshot_2026-06-28_145125-removebg-preview.png")} alt="Hero" style={s.heroImg} />
        </div>
      </section>

      {/* Leaders */}
      <section style={s.leadersSection}>
        <div style={s.sectionTitle}>
          <span style={s.sectionTitleSpan}>{t("أفضل المنجزين","TOP ACHIEVERS")}</span>
          <h2 style={s.sectionTitleH2}>{t("قادتنا","Our Leaders")}</h2>
          <p style={s.sectionTitleP}>{t("نكرم الأعضاء الذين حققوا إنجازات استثنائية.","Recognizing members who achieved exceptional milestones.")}</p>
        </div>
        <div style={s.leadersSlider}>
          {leaders.length === 0 ? (
            <p style={{color:"#7c7c86",textAlign:"center",width:"100%",padding:40}}>{t("لا يوجد قادة بعد","No leaders yet")}</p>
          ) : leaders.map((l, i) => (
            <div key={l.id || i} style={s.leaderCard}>
              <div style={s.rankIcon}>{l.icon || "🏆"}</div>
              <img src={l.avatar || img("ahmed.png")} alt="" style={s.leaderImg} />
              <h3 style={s.leaderName}>{l.name}</h3>
              <div style={{...s.rank,...rankColors[rankClassMap[l.rank] || "senior"]}}>{l.rank}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse All Courses CTA */}
      <div style={{textAlign:"center",padding:"40px 20px 0"}}>
        <Link to="/courses" style={{display:"inline-flex",alignItems:"center",gap:10,padding:"14px 36px",background:"#2563ff",color:"#fff",borderRadius:14,textDecoration:"none",fontSize:16,fontWeight:700,transition:"0.3s",boxShadow:"0 6px 20px rgba(37,99,255,0.3)"}}>
          {t("عرض كل الكورسات", "Browse All Courses")} <span style={{fontSize:18}}>→</span>
        </Link>
      </div>

      {/* Courses */}
      <section style={s.courses}>
        <div style={s.coursesHeader}>
          <span style={s.coursesHeaderSpan}>{t("كورسات مميزة","PREMIUM COURSES")}</span>
          <h2 style={s.coursesHeaderH2}>{t("ابن مستقبلك بـ","Build Your Future With")} <span style={s.coursesHeaderH2Span}>{t("المهارات الرقمية","Digital Skills")}</span></h2>
          <p style={s.coursesHeaderP}>{t("تعلم المهارات الأكثر ربحية عبر الإنترنت ببرامج تدريبية عملية عالية الجودة.","Learn the most profitable online skills with practical, premium-quality training programs.")}</p>
        </div>
        <div style={s.coursesGrid}>
          {courses.length === 0 ? (
            <p style={{color:"#999",padding:20,fontSize:15}}>{t("لا توجد كورسات متاحة بعد.","No courses available yet.")}</p>
          ) : courses.map((c) => (
            <div key={c.id} style={s.courseCard}>
              <img src={c.featured_image || img("trading.png")} alt="" style={s.courseImage} onError={(e) => { e.target.src = img("trading.png"); }} />
              <h3 style={s.courseCardH3}>{c.title_ar || c.title}</h3>
              <p style={s.courseCardP}>{(c.description_ar || c.description || "").slice(0,80)}...</p>
              <div style={s.courseFooter}>
                <div>
                  <div style={{color:"#ffb800",fontSize:"0.85rem"}}>⭐⭐⭐⭐⭐ 4.9</div>
                  <div style={{fontSize:"1.3rem",color:"#111",marginTop:3}}>{c.price} {t("ج.م","EGP")}</div>
                </div>
                <Link to={`/courses/${c.id}`} style={s.courseBtn}>{t("اشترك ←","Enroll →")}</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rank Guide */}
      <section style={s.rankGuide}>
        <div style={s.guideHeader}>
          <span style={s.guideHeaderSpan}>{t("دليل الرتب","RANK GUIDE")}</span>
          <h2 style={s.guideHeaderH2}>{t("كيف تصل إلى","How To Reach")} <span style={{position:"relative",color:"#111"}}>{t("رتبتك التالية","Your Next Rank")}</span></h2>
          <p style={s.guideHeaderP}>{t("تعرف على متطلبات ومكافآت كل رتبة في إيفرست.","Learn the requirements and rewards for every Everest rank.")}</p>
        </div>
        <div style={s.guideWrapper}>
          {ranks.map((r, i) => (
            <div key={i} style={{...s.guideItem,...(i === ranks.length-1 ? {borderBottom:"none"} : {})}}>
              <div style={s.guideSummary} onClick={() => setOpenRank(openRank === i ? -1 : i)}>
                <span>{r.icon} {r.name}</span>
                <span style={{fontSize:"1.3rem",color:"#999",transition:"0.3s",transform:openRank === i ? "rotate(45deg)" : "none"}}>+</span>
              </div>
              {openRank === i && (
                <div style={s.guideContent}>
                  <p style={s.guideContentP}><strong style={s.guideContentStrong}>{t("المتطلبات:","Requirement:")}</strong> {r.req}</p>
                  <p style={s.guideContentP}><strong style={s.guideContentStrong}>{t("المكافأة:","Reward:")}</strong> {r.reward}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerHelp}>
          <p>{t("تحتاج مساعدة؟ زر","Need Help? Visit our")} <a href="#" style={s.footerHelpA}>{t("قسم المساعدة","Help Section")}</a></p>
        </div>
        <div style={s.footerTop}>
          <div style={s.footerSocial}>
            {["instagram","x-twitter","paper-plane","youtube","linkedin-in","facebook-f"].map((icon) => (
              <a key={icon} href="#" style={s.footerSocialA}><i className={`fa-brands fa-${icon}`}></i></a>
            ))}
          </div>
          <div style={s.footerBrand}>
            <span style={s.footerBrandSpan}>{t("إيفرست أكاديمي 2026","Everest Academy 2026")}</span>
            <h3 style={s.footerBrandH3}>E</h3>
          </div>
        </div>
        <div style={s.footerContact}>{t("طرق أخرى للتواصل:","More ways to reach us:")} <span style={s.footerContactSpan}>+44 (0) 20 7776 9720 (24/5)</span></div>
        <div style={s.footerBottom}>
          {[t("أكاديمية إيفرست لا تقدم خدمات للمقيمين...","Everest Academy doesn't offer services to residents..."), t("أكاديمية إيفرست علامة تجارية مسجلة مستخدمة بموجب...","Everest Academy is a registered trademark utilised under..."), <><strong style={s.footerItemStrong}>{t("تداول بمسؤولية:","Trade Responsibly:")}</strong> {t("تداول الأدوات المالية ينطوي على مستوى عالٍ من المخاطر...","Trading financial instruments carry a high level...")}</>].map((text, i) => (
            <div key={i} style={s.footerItem}>{text}</div>
          ))}
        </div>
      </footer>

      {/* AI Chat */}
      <div className="ai-trigger" onClick={() => { setChatOpen(!chatOpen); if (!chatOpen) { if (!activeConvId && conversations.length > 0) setActiveConvId(conversations[0].id); if (conversations.length === 0) newChat(); } }}>
        <div className="ai-ring"></div>
        <div className="ai-core"><span>AI</span></div>
      </div>
      <div className={`ai-window ${chatOpen ? "open" : ""}`}>
        <div className="ai-header">
          <button className="ai-menu-btn" onClick={() => setChatSidebar(!chatSidebar)}>☰</button>
          <div className="ai-header-info">
            <div style={{textAlign:"center",flex:1}}>
              <h5>{activeConv?.title || t("مساعد إيفرست الذكي","Everest AI Assistant")}</h5>
              <span>{t("متصل الآن","Online now")}</span>
            </div>
          </div>
          <button className="ai-new-chat-btn" onClick={newChat}>+</button>
          <button className="ai-close" onClick={() => setChatOpen(false)}>
            <svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
          </button>
        </div>
        <div style={{display:"flex",flex:1,overflow:"hidden"}}>
          {chatSidebar && (
            <div className="ai-sidebar">
              <div className="ai-sidebar-header">
                <span>{t("المحادثات","Conversations")}</span>
              </div>
              {conversations.map(c => (
                <div key={c.id} className={`ai-sidebar-item ${c.id === activeConvId ? "active" : ""}`} onClick={() => { setActiveConvId(c.id); setChatSidebar(false); }}>
                  <span className="ai-sidebar-title">{c.title}</span>
                  <button className="ai-sidebar-del" onClick={(e) => deleteChat(e, c.id)}>🗑</button>
                </div>
              ))}
            </div>
          )}
          <div style={{flex:1,display:"flex",flexDirection:"column"}}>
            <div className="ai-body" ref={chatRef}>
              {chatMsgs.length === 0 && (
                <div className="ai-bubble bot">{t("مرحباً بك في Everest Academy! اسألني عن أي شيء!","Welcome to Everest Academy! Ask me anything!")}</div>
              )}
              {chatMsgs.map((m, i) => (
                <div key={i} className={`ai-bubble ${m.role === "user" ? "user" : "bot"}`}>{m.text}</div>
              ))}
              {chatLoading && <div className="ai-bubble bot">...</div>}
            </div>
            <div className="ai-footer">
              <div className="ai-input-wrap">
                <input type="text" placeholder={t("اكتب سؤالك هنا...","Type your question here...")} value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} />
                <button className="ai-send" onClick={sendChat}>
                  <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
