import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useLang } from "../LangContext";
import LanguageToggle from "./LanguageToggle";
import NotificationBell from "./NotificationBell";

const navItems = [
  { to: "/home", label_ar: "الأكاديمية", label_en: "Academy" },
  { to: "/my-courses", label_ar: "كورساتي", label_en: "My Courses" },
  { to: "/courses", label_ar: "جميع الكورسات", label_en: "All Courses" },
  { to: "/top-saller", label_ar: "أفضل بائع", label_en: "Top Saller" },
  { to: "/affiliate?tab=team", label_ar: "التسويق بالعمولة", label_en: "Affiliate Marketing" },
  { to: "/rankings", label_ar: "الرتب", label_en: "Ranks" },
  { to: "/about", label_ar: "عن إيفرست", label_en: "About Everest" },
  { to: "/feedback", label_ar: "التقييم", label_en: "Feedback" },
];

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const { t, lang, dir } = useLang();
  const loc = useLocation();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); nav("/login"); };

  return (
    <>
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)",
        padding: "0 30px", height: 72, display: "flex",
        alignItems: "center", justifyContent: "space-between",
        direction: dir
      }}>
        <Link to="/home" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/image/logo3.png" alt="Logo" style={{ height: 46 }} />
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {navItems.map((item) => {
            const itemPath = item.to.split("?")[0];
            const isActive = loc.pathname === itemPath;
            return (
              <Link key={item.to + item.label_en} to={item.to} style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                textDecoration: "none", color: isActive ? "#2563ff" : "#444",
                background: isActive ? "rgba(37,99,255,0.08)" : "transparent",
                transition: "0.3s", whiteSpace: "nowrap"
              }}>
                {t(item.label_ar, item.label_en)}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LanguageToggle minimal />
          {user && <NotificationBell userId={user.id} />}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => nav("/profile")}>
              {user?.avatar && user.avatar.trim() ? (
                <img src={user.avatar} alt="" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#2563ff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20 }}>
                  {(user?.full_name || "U")[0].toUpperCase()}
                </div>
              )}
              <div style={{ display: "none" }}>
                <h5 style={{ fontSize: 13, margin: 0, color: "#222" }}>{user.full_name || "User"}</h5>
                <small style={{ fontSize: 11, color: "#888" }}>{user.role === "admin" ? t("مدير", "Admin") : t("طالب", "Student")}</small>
              </div>
            </div>
          ) : (
            <Link to="/login" style={{
              background: "#2563ff", color: "#fff", border: "none", borderRadius: 8,
              padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              textDecoration: "none"
            }}>
              {t("تسجيل الدخول", "Login")}
            </Link>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, cursor: "pointer", padding: 8 }} onClick={() => setMenuOpen(!menuOpen)}>
            <span style={{ width: 22, height: 2, background: "#333", borderRadius: 2 }}></span>
            <span style={{ width: 22, height: 2, background: "#333", borderRadius: 2 }}></span>
            <span style={{ width: 22, height: 2, background: "#333", borderRadius: 2 }}></span>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(5px)", zIndex: 998 }} onClick={() => setMenuOpen(false)} />
      )}
      <div style={{
        position: "fixed", top: 0, right: menuOpen ? 0 : -340, width: 300, height: "100vh",
        background: "#fff", padding: 25, display: "flex", flexDirection: "column",
        transition: "0.4s ease", zIndex: 999, boxShadow: "-15px 0 40px rgba(0,0,0,0.08)",
        direction: dir
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div style={{ width: 42, height: 42, background: "#f6f6f6", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={() => setMenuOpen(false)}>
            <i className="fa-solid fa-xmark" style={{ fontSize: 18 }}></i>
          </div>
        </div>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6, padding: 0, margin: 0 }}>
          {navItems.map((item) => {
            const itemPath = item.to.split("?")[0];
            return (
            <li key={item.to + item.label_en}>
              <Link to={item.to} style={{
                display: "flex", alignItems: "center", gap: 14, height: 50, padding: "0 18px",
                borderRadius: 14, textDecoration: "none", fontSize: 15, fontWeight: 600,
                color: loc.pathname === itemPath ? "#2563ff" : "#333",
                background: loc.pathname === itemPath ? "rgba(37,99,255,.06)" : "transparent",
                transition: "0.3s"
              }} onClick={() => setMenuOpen(false)}>
                {t(item.label_ar, item.label_en)}
              </Link>
            </li>
            );
          })}
          {user && (
            <li>
              <Link to="/profile" style={{
                display: "flex", alignItems: "center", gap: 14, height: 50, padding: "0 18px",
                borderRadius: 14, textDecoration: "none", fontSize: 15, fontWeight: 600,
                color: loc.pathname === "/profile" ? "#2563ff" : "#333",
                background: loc.pathname === "/profile" ? "rgba(37,99,255,.06)" : "transparent",
                transition: "0.3s"
              }} onClick={() => setMenuOpen(false)}>
                {t("الملف الشخصي", "Profile")}
              </Link>
            </li>
          )}
        </ul>
        {user && (
          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 14, padding: 18, borderRadius: 18, background: "#fafafa" }}>
            <div style={{ width: 55, height: 55, borderRadius: "50%", background: "#2563ff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 22 }}>
              {user.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h4 style={{ fontSize: 16, marginBottom: 4, margin: 0 }}>{user.full_name}</h4>
              <span style={{ fontSize: 13, color: "#888" }}>{user.role === "admin" ? t("مدير", "Admin") : t("طالب", "Student")}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
