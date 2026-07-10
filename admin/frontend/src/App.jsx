import React, { useState, useEffect } from "react";
import { LangProvider, useLang } from "./LangContext";
import RoleManagementPage from "./pages/RoleManagementPage.jsx";
import TopUpsPage from "./pages/TopUpsPage.jsx";
import CourseBuilderPage from "./pages/CourseBuilderPage.jsx";
import CoursesListPage from "./pages/CoursesListPage.jsx";
import QuizAttemptsPage from "./pages/QuizAttemptsPage.jsx";
import StudentListPage from "./pages/StudentListPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import PurchaseRequestsPage from "./pages/PurchaseRequestsPage.jsx";
import UpgradeRequestsPage from "./pages/UpgradeRequestsPage.jsx";
import LeadersPage from "./pages/LeadersPage.jsx";
import PaymentGatewayPage from "./pages/PaymentGatewayPage.jsx";
import RanksManagementPage from "./pages/RanksManagementPage.jsx";
import RegistrationApprovalsPage from "./pages/RegistrationApprovalsPage.jsx";

const api = (path, opts = {}) =>
  fetch(path, { headers: { "Content-Type": "application/json" }, ...opts }).then((r) => r.json());

function AppInner() {
  const [page, setPage] = useState("dashboard");
  const [stats, setStats] = useState({});
  const { lang, toggle } = useLang();

  useEffect(() => {
    api("/api/dashboard/stats").then(setStats);
  }, []);

  const navItems = [
    { id: "dashboard", label: lang === "ar" ? "الإحصائيات" : "Dashboard", icon: "📊" },
    { id: "approvals", label: lang === "ar" ? "تفعيل الحسابات" : "Account Approvals", icon: "🔐" },
    { id: "users", label: lang === "ar" ? "إدارة المستخدمين" : "User Management", icon: "👤" },
    { id: "payment-gateway", label: lang === "ar" ? "بوابات الدفع" : "Payment Gateway", icon: "💳" },
    { id: "role-mgmt", label: lang === "ar" ? "إدارة الصلاحيات" : "Role Management", icon: "🔐" },
    { id: "purchases", label: lang === "ar" ? "طلبات الشراء" : "Purchases", icon: "🛒" },
    { id: "upgrades", label: lang === "ar" ? "طلبات الترقية" : "Upgrades", icon: "⬆️" },
    { id: "topups", label: lang === "ar" ? "طلبات الشحن" : "Top-ups", icon: "💰" },
    { id: "course-builder", label: lang === "ar" ? "بناء الكورس" : "Course Builder", icon: "📝" },
    { id: "courses", label: lang === "ar" ? "قائمة الكورسات" : "Courses", icon: "📚" },
    { id: "quiz-attempts", label: lang === "ar" ? "نتائج الاختبارات" : "Quiz Results", icon: "📋" },
    { id: "student-list", label: lang === "ar" ? "قائمة الطلاب" : "Students", icon: "🎓" },
    { id: "ranks-mgmt", label: lang === "ar" ? "إدارة الرتب" : "Ranks", icon: "🏅" },
    { id: "leaders", label: lang === "ar" ? "القادة" : "Leaders", icon: "🏆" },
    { id: "profile-settings", label: lang === "ar" ? "الإعدادات الشخصية" : "Settings", icon: "⚙️" },
  ];

  return (
    <div className="flex h-screen bg-gray-50" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Sidebar navItems={navItems} current={page} onChange={setPage} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-4">
            <button
              onClick={toggle}
              className="px-4 py-2 text-sm font-medium bg-white border rounded-lg shadow-sm hover:bg-gray-50"
            >
              {lang === "ar" ? "English" : "العربية"}
            </button>
          </div>
          {page === "dashboard" && <DashboardPage stats={stats} />}
          {page === "approvals" && <RegistrationApprovalsPage />}
          {page === "users" && <UsersPage />}
          {page === "role-mgmt" && <RoleManagementPage />}
          {page === "purchases" && <PurchaseRequestsPage />}
          {page === "upgrades" && <UpgradeRequestsPage />}
          {page === "topups" && <TopUpsPage />}
          {page === "course-builder" && <CourseBuilderPage />}
          {page === "courses" && <CoursesListPage />}
          {page === "quiz-attempts" && <QuizAttemptsPage />}
          {page === "student-list" && <StudentListPage />}
          {page === "ranks-mgmt" && <RanksManagementPage />}
          {page === "leaders" && <LeadersPage />}
          {page === "payment-gateway" && <PaymentGatewayPage />}
          {page === "profile-settings" && <ProfilePage />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return <LangProvider><AppInner /></LangProvider>;
}

function Sidebar({ navItems, current, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-4 right-4 z-50 bg-everest-950 text-white p-2 rounded-lg">
        ☰
      </button>
      <aside className={`${open ? "block" : "hidden"} lg:block w-64 bg-everest-950 text-white flex flex-col fixed lg:static inset-y-0 right-0 z-40`}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h1 className="text-lg font-bold"><span className="text-everest-400">Everest</span> Admin</h1>
          <button onClick={() => setOpen(false)} className="lg:hidden text-white/60">✕</button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onChange(item.id); setOpen(false); }}
              className={`w-full text-right px-4 py-3 rounded-lg text-sm font-medium transition flex items-center gap-3 ${
                current === item.id ? "bg-everest-600 text-white" : "text-gray-300 hover:bg-white/5"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}

function AnimatedNumber({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0; const duration = 1200; const step = Math.ceil(Math.max(1, value / 30));
    const timer = setInterval(() => { start += step; if (start >= value) { setDisplay(value); clearInterval(timer); } else setDisplay(start); }, duration / 30);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString()}{suffix}</>;
}

function RingChart({ value, max, color, size = 90 }) {
  const r = 36; const circ = 2 * Math.PI * r; const pct = Math.min(value / (max || 1), 1);
  return (
    <svg width={size} height={size} viewBox="0 0 90 90" style={{transform:"rotate(-90deg)"}}>
      <circle cx="45" cy="45" r={r} fill="none" stroke="#f0f0f0" strokeWidth="7" />
      <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="7" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round" style={{transition:"stroke-dashoffset 1.5s ease"}} />
    </svg>
  );
}

function DashboardPage({ stats }) {
  const mainCards = [
    { label: "إجمالي المستخدمين", value: stats.totalUsers, color: "#6366f1", bg: "from-indigo-500", light: "#eef2ff" },
    { label: "الطلاب النشطين", value: stats.totalStudents, color: "#10b981", bg: "from-emerald-500", light: "#ecfdf5" },
    { label: "الكورسات", value: stats.totalCourses, color: "#8b5cf6", bg: "from-violet-500", light: "#f5f3ff" },
    { label: "العمولات", value: stats.totalCommissions, color: "#f59e0b", bg: "from-amber-500", light: "#fffbeb", suf: "" },
  ];

  const ringData = [
    { label: "طلاب ← تسجيل", value: stats.totalStudents, max: stats.totalUsers || 1, color: "#10b981" },
    { label: "منشور ← كل الكورسات", value: stats.publishedCourses, max: stats.totalCourses || 1, color: "#8b5cf6" },
    { label: "اشتراكات مكتملة", value: stats.approvedEnrollments, max: stats.totalEnrollments || 1, color: "#6366f1" },
  ];

  const pendingCards = [
    { label: "بانتظار التفعيل", value: stats.pendingApprovals, icon: "👤", color: "#f59e0b" },
    { label: "شحن معلق", value: stats.topUpPending, icon: "💰", color: "#ef4444" },
    { label: "طلبات شراء", value: stats.purchaseRequests, icon: "🛒", color: "#ec4899" },
    { label: "طلبات ترقية", value: stats.upgradeRequests, icon: "⬆️", color: "#8b5cf6" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">📊 لوحة الإحصائيات</h1>
          <p className="text-gray-500 text-sm mt-1">نظرة عامة على أداء المنصة</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-lg border">{new Date().toLocaleDateString("ar-EG", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</div>
          <button onClick={async () => {
            if (!confirm("هل أنت متأكد من تشغيل العمولة الأسبوعية؟")) return;
            try {
              const r = await api("/api/mlm/weekly-commission", { method: "POST" });
              alert(`✅ تم تشغيل العمولة!\nتم الدفع لـ ${r.awarded} مستخدم من أصل ${r.total_users}`);
              window.location.reload();
            } catch(e) { alert("❌ " + e.message); }
          }} className="px-4 py-2 text-sm bg-amber-50 border border-amber-200 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-2 text-amber-800">
            <span className="text-base">🏆</span> تشغيل العمولة الأسبوعية
          </button>
          <button onClick={() => window.location.reload()} className="px-4 py-2 text-sm bg-white border rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-2">
            <span className="text-base">🔄</span> تحديث
          </button>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {mainCards.map((c, i) => (
          <div key={i} className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" style={{animation: `slideUp 0.4s ease ${i * 0.08}s both`}}>
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-gradient-to-br ${c.bg} to-white/5 opacity-10`} />
            <p className="text-gray-500 text-xs font-medium mb-2">{c.label}</p>
            <p className="text-3xl font-extrabold text-gray-900">
              <AnimatedNumber value={c.value || 0} suffix={c.suf || (c.label === "العمولات" ? " EM" : "")} />
            </p>
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${c.bg} to-transparent`} style={{width:"100%",animation: `progressFill 1s ease ${0.3 + i * 0.1}s both`}} />
            </div>
          </div>
        ))}
      </div>

      {/* Ring charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {ringData.map((r, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-5" style={{animation: `slideUp 0.4s ease ${0.4 + i * 0.1}s both`}}>
            <RingChart value={r.value} max={r.max} color={r.color} />
            <div>
              <p className="text-gray-700 font-bold text-sm">{r.label}</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">
                <AnimatedNumber value={r.value || 0} /> <span className="text-gray-400 text-base">/ {r.max}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{Math.round((r.value / (r.max || 1)) * 100)}% من الإجمالي</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending items row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {pendingCards.map((c, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-all duration-300" style={{animation: `slideUp 0.4s ease ${0.7 + i * 0.08}s both`}}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg" style={{background: c.color + "15"}}>{c.icon}</div>
            <div>
              <p className="text-gray-400 text-xs">{c.label}</p>
              <p className="text-xl font-extrabold text-gray-900"><AnimatedNumber value={c.value || 0} /></p>
            </div>
          </div>
        ))}
      </div>

      {/* Extra details in a compact footer card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5" style={{animation: "slideUp 0.4s ease 1s both"}}>
        <div className="flex items-center gap-2 mb-3"><span className="text-sm">📋</span><span className="text-sm font-bold text-gray-700">تفاصيل إضافية</span></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            ["إجمالي المسجلين", stats.totalEnrollments, "📋"],
            ["حسابات تسجيل", stats.totalRegistration, "📝"],
            ["إجمالي E-Money", stats.totalEMoney, "💳"],
            ["كورسات منشورة", stats.publishedCourses, "✅"],
          ].map(([label, val, icon], i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
              <span>{icon}</span>
              <div><p className="text-gray-500 text-xs">{label}</p><p className="font-bold text-gray-800">{val || 0}</p></div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes progressFill { from { width: 0%; } }
      `}</style>
    </div>
  );
}
