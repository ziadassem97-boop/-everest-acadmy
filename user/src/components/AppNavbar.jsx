import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useLang } from "../LangContext";
import { useTheme } from "../ThemeContext";
import NotificationBell from "./NotificationBell";

const useIsMobile = () => {
  const [m, setM] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return m;
};

function ThemeToggle({ c }) {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle} title={theme === "dark" ? "Light Mode" : "Dark Mode"} style={{
      width: 40, height: 40, borderRadius: 12, border: `1px solid ${c.border}`,
      background: c.bg, cursor: "pointer", display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: 18, transition: "0.3s"
    }}>
      {theme === "dark" ? "\u2600\uFE0F" : "\uD83C\uDF19"}
    </button>
  );
}

const navItems = [
  { to: "/home", label_ar: "الرئيسية", label_en: "Home", icon: "fa-solid fa-house" },
  { to: "/my-courses", label_ar: "كورساتي", label_en: "My Courses", icon: "fa-solid fa-book-open" },
  { to: "/courses", label_ar: "الكورسات", label_en: "Courses", icon: "fa-solid fa-graduation-cap" },
  { to: "/rankings", label_ar: "الرتب", label_en: "Ranks", icon: "fa-solid fa-trophy", studentOnly: true },
  { to: "/affiliate?tab=team", label_ar: "التسويق", label_en: "Affiliate", icon: "fa-solid fa-handshake", studentOnly: true },
  { to: "/top-saller", label_ar: "الأفضل", label_en: "Top", icon: "fa-solid fa-star", studentOnly: true },
  { to: "/feedback/new", label_ar: "التقييم", label_en: "Feedback", icon: "fa-solid fa-comment-dots" },
  { to: "/profile", label_ar: "الملف الشخصي", label_en: "Profile", icon: "fa-solid fa-user" },
];

const mobileTabItems = [
  { to: "/home", label_ar: "الرئيسية", label_en: "Home", icon: "fa-solid fa-house" },
  { to: "/my-courses", label_ar: "كورساتي", label_en: "My Courses", icon: "fa-solid fa-book-open" },
  { to: "/courses", label_ar: "الكورسات", label_en: "Courses", icon: "fa-solid fa-graduation-cap" },
  { to: "/rankings", label_ar: "الرتب", label_en: "Ranks", icon: "fa-solid fa-trophy", studentOnly: true },
  { to: "/affiliate?tab=team", label_ar: "التسويق", label_en: "Affiliate", icon: "fa-solid fa-handshake", studentOnly: true },
  { to: "/top-saller", label_ar: "الأفضل", label_en: "Top", icon: "fa-solid fa-star", studentOnly: true },
  { to: "/feedback/new", label_ar: "التقييم", label_en: "Feedback", icon: "fa-solid fa-comment-dots" },
  { to: "/profile", label_ar: "حسابي", label_en: "Profile", icon: "fa-solid fa-user" },
];

const isStudentAccount = (user) => !user || user.account_type === "student";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const { t, lang, dir } = useLang();
  const { theme, toggle, colors: c } = useTheme();
  const loc = useLocation();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const m = useIsMobile();

  if (!user) return null;

  const isActive = (path) => {
    const p = path.split("?")[0];
    return loc.pathname === p;
  };

  return (
    <>
      {/* Mobile Header (phone only) */}
      {m && (
        <header style={{
          position: "sticky", top: 0, zIndex: 100,
          background: c.bgSoft, borderBottom: `1px solid ${c.border}`,
          padding: "0 16px", height: 56, display: "flex",
          alignItems: "center", justifyContent: "space-between",
          boxShadow: c.shadow, direction: dir,
        }}>
          <Link to="/home" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/image/logo-navbar.png" alt="Logo" style={{ height: 52 }} />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user && <NotificationBell userId={user.id} />}
            <button onClick={() => setMenuOpen(!menuOpen)} style={{width:36,height:36,borderRadius:10,background:c.bgSoft,border:`1px solid ${c.border}`,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,padding:0}}>
              {[1,2,3].map((_, i) => <span key={i} style={{width:16,height:2,background:c.text,borderRadius:2,display:"block"}} />)}
            </button>
            {user && (
              <div style={{ cursor: "pointer" }} onClick={() => nav("/profile")}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid #d4af37", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {user?.avatar && user.avatar.trim() ? (
                    <img src={user.avatar} alt="" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#d4af37,#b38728)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                      {(user?.full_name || "U")[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Desktop/Tablet Navbar */}
      {!m && (
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: c.bgSoft, borderBottom: `1px solid ${c.border}`,
        padding: "0 30px", height: 72, display: "flex",
        alignItems: "center", justifyContent: "space-between",
        boxShadow: c.shadow, direction: dir
      }}>
        <Link to="/home" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/image/logo-navbar.png" alt="Logo" style={{ height: 80 }} />
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {navItems.filter(item => !item.studentOnly || isStudentAccount(user)).map((item) => {
            const active = isActive(item.to);
            return (
              <Link key={item.to + item.label_en} to={item.to}
                style={{
                  padding: "8px 14px", borderRadius: 8, fontSize: 13.5, fontWeight: 600,
                  textDecoration: "none", color: active ? c.text : c.textSoft,
                  background: "transparent", whiteSpace: "nowrap",
                  borderBottom: active ? `2px solid ${c.primary}` : "2px solid transparent",
                  marginBottom: -2, letterSpacing: "0.2px"
              }}>
                {t(item.label_ar, item.label_en)}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user && <NotificationBell userId={user.id} />}
          <ThemeToggle c={c} />
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => nav("/profile")}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", border: "2px solid #d4af37", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {user?.avatar && user.avatar.trim() ? (
                  <img src={user.avatar} alt="" style={{width:34,height:34,borderRadius:"50%",objectFit:"cover"}} />
                ) : (
                  <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#d4af37,#b38728)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:16}}>
                    {(user?.full_name||"U")[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link to="/login" style={{
              background: "linear-gradient(135deg,#d4af37,#b38728)",
              color: "#fff", border: "none", borderRadius: 10,
              padding: "8px 18px", fontSize: 13, fontWeight: 700,
              textDecoration: "none"
            }}>
              {t("تسجيل الدخول", "Login")}
            </Link>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{width:40,height:40,borderRadius:12,background: c.bg, border: `1px solid ${c.border}`, cursor:"pointer", display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,padding:0}}>
            {[1,2,3].map((_, i) => <span key={i} style={{width:18,height:2,background:c.textSoft,borderRadius:2,display:"block"}} />)}
          </button>
        </div>
      </header>
      )}

      {/* Backdrop */}
      {menuOpen && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",zIndex:998,transition:"opacity 0.3s",opacity:1}} onClick={()=>setMenuOpen(false)} />
      )}

      {/* Side Drawer */}
      <div style={{
        position:"fixed",top:0,right:menuOpen?0:"-82%",width:"82%",maxWidth:360,height:"100vh",
        background:"linear-gradient(180deg,#0a0a12 0%,#12121f 50%,#0d0d18 100%)",display:"flex",flexDirection:"column",
        transition:"right 0.35s cubic-bezier(.4,0,.2,1)",zIndex:999,
        boxShadow:menuOpen?"-8px 0 40px rgba(0,0,0,0.4)":"none",
        direction: dir,overflow:"hidden"
      }}>
        {/* Gold accent bar */}
        <div style={{height:4,background:"linear-gradient(90deg,#d4af37,#f0d060,#d4af37)",flexShrink:0}} />
        {/* Header */}
        <div style={{padding:"28px 24px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${c.border}`,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:48,height:48,borderRadius:16,background:"linear-gradient(135deg,#d4af37,#b38728)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 16px rgba(212,175,55,0.4)"}}>
              <span style={{color:"#fff",fontWeight:800,fontSize:22,fontFamily:"'Cairo',sans-serif"}}>E</span>
            </div>
            <div>
              <h2 style={{margin:0,fontSize:18,fontWeight:700,color:c.text,lineHeight:1.2}}>Everest Academy</h2>
              <span style={{fontSize:11,color:"#d4af37",letterSpacing:0.5,fontWeight:600}}>{t("تعلم • ابنِ • انمُ", "Learn • Build • Grow")}</span>
            </div>
          </div>
          <button onClick={()=>setMenuOpen(false)} style={{width:38,height:38,borderRadius:11,background:c.bgSoft,border:`1px solid ${c.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:c.textMuted,fontSize:16,transition:"0.2s"}} onMouseEnter={e=>{e.currentTarget.style.background=c.bgInput}} onMouseLeave={e=>{e.currentTarget.style.background=c.bgSoft}}>
            <i className="fa-solid fa-xmark" style={{fontSize:15}}></i>
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div style={{margin:"16px 20px 0",padding:"14px 16px",borderRadius:16,background:c.bgSoft,border:`1px solid ${c.border}`,display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
            <div style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#d4af37,#b38728)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:16,flexShrink:0}}>
              {user.full_name?.[0]?.toUpperCase()||"U"}
            </div>
            <div style={{minWidth:0}}>
              <h4 style={{margin:0,fontSize:14,fontWeight:600,color:c.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.full_name}</h4>
              <span style={{fontSize:11,color:c.textMuted}}>{user.role === "admin" ? t("مدير", "Admin") : t("طالب", "Student")}</span>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav style={{flex:1,overflowY:"auto",padding:"16px 12px",display:"flex",flexDirection:"column",gap:2}}>
          {navItems.filter(item => !item.studentOnly || isStudentAccount(user)).map((item) => {
            const active = isActive(item.to);
            return (
              <Link key={item.to + item.label_en} to={item.to} onClick={()=>setMenuOpen(false)} style={{
                display:"flex",alignItems:"center",gap:14,height:48,padding:"0 16px",borderRadius:14,
                textDecoration:"none",fontSize:14,fontWeight:600,
                color:active?"#d4af37":c.text,
                background:active?c.goldLight:"transparent",
                transition:"all 0.2s ease",
              }} onMouseEnter={e=>{if(!active){e.currentTarget.style.background=c.bgSoft;e.currentTarget.style.transform="translateX(-2px)"}}} onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.transform="none"}}}>
                <i className={item.icon} style={{width:20,textAlign:"center",fontSize:15,color:active?"#d4af37":c.textMuted,flexShrink:0}}></i>
                <span>{t(item.label_ar,item.label_en)}</span>
                {active && <div style={{marginRight:"auto",width:6,height:6,borderRadius:"50%",background:"#d4af37"}} />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div style={{padding:"16px 20px 24px",borderTop:`1px solid ${c.border}`,flexShrink:0,display:"flex",flexDirection:"column",gap:10}}>
          {/* Language + Theme row */}
          <div style={{display:"flex",gap:10}}>
            <button onClick={toggleLang} style={{flex:1,height:44,borderRadius:12,background:c.bgSoft,border:`1px solid ${c.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontSize:13,fontWeight:600,color:c.text,fontFamily:"inherit",transition:"0.2s"}} onMouseEnter={e=>{e.currentTarget.style.background=c.bgInput}} onMouseLeave={e=>{e.currentTarget.style.background=c.bgSoft}}>
              <i className="fa-solid fa-globe" style={{fontSize:14,color:c.textMuted}}></i>
              {lang === "ar" ? "English" : "العربية"}
            </button>
            <button onClick={toggle} style={{width:44,height:44,borderRadius:12,background:c.bgSoft,border:`1px solid ${c.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,transition:"0.2s"}} onMouseEnter={e=>{e.currentTarget.style.background=c.bgInput}} onMouseLeave={e=>{e.currentTarget.style.background=c.bgSoft}}>
              <i className={theme==="dark"?"fa-solid fa-sun":"fa-solid fa-moon"} style={{fontSize:15,color:c.textMuted}}></i>
            </button>
          </div>
          {/* Auth buttons */}
          <Link to="/login" onClick={()=>setMenuOpen(false)} style={{
            display:"flex",alignItems:"center",justifyContent:"center",height:46,borderRadius:14,
            textDecoration:"none",fontSize:14,fontWeight:700,
            background:c.bgSoft,color:c.text,border:`1px solid ${c.border}`,
            transition:"0.2s"
          }} onMouseEnter={e=>{e.currentTarget.style.background=c.bgInput}} onMouseLeave={e=>{e.currentTarget.style.background=c.bgSoft}}>
            {t("تسجيل الدخول", "Login")}
          </Link>
          <Link to="/register" onClick={()=>setMenuOpen(false)} style={{
            display:"flex",alignItems:"center",justifyContent:"center",height:46,borderRadius:14,
            textDecoration:"none",fontSize:14,fontWeight:700,
            background:"linear-gradient(135deg,#d4af37,#b38728)",color:"#fff",
            boxShadow:"0 4px 16px rgba(212,175,55,0.3)",
            transition:"all 0.2s"
          }} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 24px rgba(212,175,55,0.45)"}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 16px rgba(212,175,55,0.3)"}}>
            {t("إنشاء حساب", "Sign Up")}
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="mobile-tab-bar" style={{
        background: theme === "dark" ? "rgba(20,20,30,0.95)" : "rgba(255,255,255,0.95)",
      }}>
        <div className="mobile-tab-bar-inner" style={{
          background: theme === "dark" ? "rgba(20,20,30,0.95)" : "rgba(255,255,255,0.95)",
          borderTopColor: c.border,
        }}>
          {mobileTabItems.filter(item => !item.studentOnly || isStudentAccount(user)).map((item) => {
            const active = isActive(item.to);
            return (
              <Link key={item.to} to={item.to} className={active ? "active" : ""} style={{
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                gap:2,textDecoration:"none",flex:1,height:"100%",
                color: active ? "#d4af37" : c.textMuted,
                position:"relative",
              }}>
                <span className="tab-icon"><i className={item.icon} style={{fontSize:18}}></i></span>
                <span className="tab-label" style={{color: active ? "#d4af37" : c.textMuted}}>
                  {t(item.label_ar, item.label_en)}
                </span>
                {active && (
                  <div style={{
                    position:"absolute",top:4,width:20,height:3,borderRadius:3,
                    background:"#d4af37",
                  }} />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
