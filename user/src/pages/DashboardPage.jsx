import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useLang } from "../LangContext";
import { api } from "../App";
import AppNavbar from "../components/AppNavbar";

export default function DashboardPage() {
  const { t, dir } = useLang();
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api("/api/dashboard/stats").then(setStats).catch(() => {});
    if (user) api(`/api/courses/my?userId=${user.id}&status=approved`).then(setCourses).catch(() => {});
  }, [user]);

  const memDays = user?.membership_days || 365;
  const memProgress = user?.membership_progress || 65;

  return (
    <div>
      <AppNavbar />

      {/* Membership Card */}
      <section className="membership-card">
        <div className="membership-content">
          <div>
            <span className="membership-label">{t("العضوية نشطة","Membership Active")}</span>
            <h2 id="countdown">{memDays} {t("يوم متبقي","Days Remaining")}</h2>
          </div>
          <button className="renew-btn">{t("تجديد الآن","Renew Now")}</button>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{width: `${memProgress}%`}}></div>
        </div>
      </section>

      {/* Overview */}
      <section className="dash-overview">
        <div className="welcome-card">
          <span className="welcome-tag">{t("مرحباً بعودتك 👋","Welcome Back 👋")}</span>
          <h2>{user?.full_name}</h2>
          <p>{t("واصل بناء شبكتك، أكمل كورساتك وافتح الرتبة التالية.","Continue building your network, complete your courses and unlock the next rank.")}</p>
          <div className="overview-stats">
            <div className="mini-stat">
              <h3>{stats?.courses_count || user?.courses_count || 0}</h3>
              <span>{t("الكورسات","Courses")}</span>
            </div>
            <div className="mini-stat">
              <h3>{user?.e_money || 0}</h3>
              <span>{t("الرصيد","E-Money")}</span>
            </div>
          </div>
        </div>
        <div className="rank-card">
          <div className="rl">{t("الرتبة الحالية","Current Rank")}</div>
          <h3>⭐ {user?.rank || "Star"}</h3>
          <p>{t("طوّر مبيعات فريقك لفتح الرتبة التالية.","Grow your team sales to unlock the next rank.")}</p>
          <div className="next-rank">
            <span>{t("مبيعات الفريق","Team Sales")}</span>
            <strong>{user?.total_team_sales || 0}</strong>
          </div>
        </div>
      </section>

      {/* My Courses */}
      <section className="dash-section">
        <div className="section-header">
          <h2>{t("كورساتي","My Courses")}</h2>
          <Link to="/courses" className="view-all">{t("عرض الكل","View All")}</Link>
        </div>
        <div className="courses-slider">
          {courses.length === 0 ? (
            <p style={{color:"#999",padding:20}}>{t("لا توجد كورسات بعد.","No courses yet.")} <Link to="/courses" style={{color:"#d4af37"}}>{t("تصفح الكورسات","Browse courses")}</Link></p>
          ) : courses.map((c) => (
            <div key={c.id} className="slide-card">
              <div className="slide-img" style={{background:"#eee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,color:"#ccc"}}>📚</div>
              <div className="slide-body">
                <h3>{c.title_ar || c.title}</h3>
                <div className="slide-progress"><span>{t("التقدم","Progress")}</span><span>{c.progress || 0}%</span></div>
                <div className="slide-bar"><div className="slide-bar-fill" style={{width:`${c.progress || 0}%`}}></div></div>
                <Link to={`/courses/${c.id}`} className="slide-continue" style={{display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none"}}>{t("متابعة","Continue")}</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Network */}
      <section className="dash-section">
        <div className="section-header"><h2>{t("شبكة الإحالة","Referral Network")}</h2></div>
        <div className="network-grid">
          <div className="network-card"><div><span>{t("المستوى 1","Level 1")}</span><h3>{user?.direct_count || 0}</h3></div><button className="network-btn" onClick={() => nav("/affiliate")}>{t("عرض","View")}</button></div>
          <div className="network-card"><div><span>{t("المستوى 2","Level 2")}</span><h3>{Math.round((user?.direct_count || 0) * 0.4)}</h3></div><button className="network-btn" onClick={() => nav("/affiliate")}>{t("عرض","View")}</button></div>
          <div className="network-card"><div><span>{t("المستوى 3","Level 3")}</span><h3>{Math.round((user?.direct_count || 0) * 0.1)}</h3></div><button className="network-btn" onClick={() => nav("/affiliate")}>{t("عرض","View")}</button></div>
        </div>
      </section>

      {/* Rank Progress */}
      <section className="dash-section">
        <div className="rank-progress-card">
          <div className="rank-top">
            <div>
              <span className="rl">{t("الرتبة الحالية","Current Rank")}</span>
              <h2>⭐ {user?.rank || "Star"}</h2>
            </div>
            <div className="next-rank-box">
              <span>{t("مبيعات الفريق","Team Sales")}</span>
              <strong>{user?.total_team_sales || 0}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="dash-footer">
        <p>© 2026 {t("أكاديمية إيفرست. جميع الحقوق محفوظة.","Everest Academy. All Rights Reserved.")}</p>
        <div className="footer-links">
          <a href="#">{t("الدعم","Support")}</a>
          <a href="#">{t("الخصوصية","Privacy")}</a>
          <a href="#">{t("الشروط","Terms")}</a>
        </div>
      </footer>
    </div>
  );
}
