import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../LangContext";
import LanguageToggle from "../components/LanguageToggle";

export default function LandingPage() {
  const { t, lang } = useLang();
  const navRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (navRef.current) {
        navRef.current.classList.toggle("scrolled", window.scrollY > 40);
      }
    };
    window.addEventListener("scroll", onScroll);

    const reveals = document.querySelectorAll(".landing-page .reveal");
    const revealElements = () => {
      reveals.forEach((item) => {
        const top = item.getBoundingClientRect().top;
        const trigger = window.innerHeight - 100;
        if (top < trigger) item.classList.add("active");
      });
    };
    window.addEventListener("scroll", revealElements);
    revealElements();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", revealElements);
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Public Navbar - Landing only */}
      <nav className="navbar" ref={navRef}>
        <div className="nav-left">
          <Link to="/" className="logo"><img src="/image/logo3.png" alt="Everest" /></Link>
          <LanguageToggle minimal />
        </div>
        <div className="nav-right">
          <div className="auth-buttons">
            <Link to="/login" className="login-btn">{t("تسجيل الدخول", "Login")}</Link>
            <Link to="/register" className="signup-btn">{t("إنشاء حساب", "Sign Up")}</Link>
          </div>
          <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="menu">
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </nav>
      {/* Mobile Menu */}
      <div className={`menu-overlay${menuOpen ? " active" : ""}`} onClick={() => setMenuOpen(false)}></div>
      <div className={`mobile-menu${menuOpen ? " active" : ""}`}>
        <div className="mobile-header">
          <h2>Everest</h2>
          <button onClick={() => setMenuOpen(false)}>&times;</button>
        </div>
        <div className="mobile-auth" style={{marginTop:20}}>
          <Link to="/login" className="mobile-login-btn" onClick={() => setMenuOpen(false)}>{t("تسجيل الدخول", "Login")}</Link>
          <Link to="/register" className="mobile-signup-btn" onClick={() => setMenuOpen(false)}>{t("إنشاء حساب", "Sign Up")}</Link>
        </div>
      </div>

      {/* Hero */}
      <section className="hero-section">
        <video className="video-bg" autoPlay muted loop playsInline>
          <source src="video/IMG_1327.mp4" type="video/mp4" />
        </video>
        <div className="overlay"></div>
        <div className="video-content-layer">
          <img src="image/logopanner.png" className="logo-fxpro-left" alt="" />
          <div className="center-content">
            <h1>
              {t(".اتقن المهارات", ".Master Skills")}
              <br /> {t(".ابنِ مستقبلك", ".Build Your Future")} <br />
            </h1>
            <Link to="/register" className="btn-trading">{t("ابدأ الآن", "Get Started")}</Link>
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section className="tracks-section">
        <div className="tracks-card">
          <div className="tracks-header">
            <span className="tag">{t("برامجنا", "OUR PROGRAMS")}</span>
            <h2>{t("اختر مستقبلك المهني", "Choose Your Future Career")}</h2>
            <p>{t("سواء كنت تبدأ من الصفر أو تبحث عن تطوير مهارات جديدة، فإن برامجنا مصممة لمساعدتك على التعلم والنمو والتقدم بثقة.", "Whether you're starting from scratch or looking to develop new skills, our programs are designed to help you learn, grow, and move forward with confidence.")}</p>
          </div>
          <div className="tracks-grid">
            <div className="track-box">
              <div className="track-icon"><i className="fa-solid fa-bullhorn"></i></div>
              <h3>{t("Media Buying", "Media Buying")}</h3>
              <p>{t("تعلم كيفية إنشاء وإدارة وتحسين الحملات الإعلانية عالية الأداء.", "Learn how to create, manage, and optimize high-performing advertising campaigns.")}</p>
            </div>
            <div className="track-box">
              <div className="track-icon"><i className="fa-solid fa-hashtag"></i></div>
              <h3>{t("Social Media", "Social Media")}</h3>
              <p>{t("أنشئ محتوى جذاب وابنِ حضوراً رقمياً قوياً.", "Create engaging content and build a strong digital presence.")}</p>
            </div>
            <div className="track-box">
              <div className="track-icon"><i className="fa-solid fa-chart-line"></i></div>
              <h3>{t("Trading", "Trading")}</h3>
              <p>{t("تعلم تحليل السوق وإدارة المخاطر واستراتيجيات التداول.", "Learn market analysis, risk management, and trading strategies.")}</p>
            </div>
            <div className="track-box">
              <div className="track-icon"><i className="fa-solid fa-cart-shopping"></i></div>
              <h3>{t("Dropshipping", "Dropshipping")}</h3>
              <p>{t("أطلق وأدر متجرك الإلكتروني الخاص.", "Launch and manage your own online business.")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature-card">
          <span className="line"></span>
          <i className="fa-solid fa-arrow-up-down icon"></i>
          <p className="small-title">{t("بدون رسوم تبييت", "NO ROLLOVER FEES")}</p>
          <h3>0 Swap</h3>
          <p className="desc">{t("تداول بدون رسوم تبييت على جميع الأدوات، إلى الأبد.", "Trade without swap fees, on all instruments, forever.")}</p>
        </div>
        <div className="feature-card">
          <span className="line"></span>
          <i className="fa-solid fa-mountain icon"></i>
          <p className="small-title">{t("رافعة مالية عالية", "HIGH LEVERAGE")}</p>
          <h3>1:Unlimited</h3>
          <p className="desc">{t("رافعة مالية مرنة تناسب أي أسلوب تداول.", "Flexible leverage to suit any trading style.")}</p>
        </div>
        <div className="feature-card">
          <span className="line"></span>
          <i className="fa-solid fa-shield icon"></i>
          <p className="small-title">{t("رأس المال", "CAPITAL")}</p>
          <h3>$120M+</h3>
          <p className="desc">{t("انضم إلى الملايين الذين يثقون بنا في التداول الآمن.", "Join millions who trust us for secure trading.")}</p>
        </div>
        <div className="feature-card">
          <span className="line"></span>
          <i className="fa-solid fa-star icon"></i>
          <p className="small-title">{t("تطبيق تداول", "TRADING APP")}</p>
          <h3>5* Rated</h3>
          <p className="desc">{t("تطبيق حائز على جوائز للهواتف والأجهزة اللوحية.", "Award-winning app for mobiles and tablets.")}</p>
        </div>
        <div className="feature-card featured">
          <span className="line"></span>
          <div className="top-row">
            <span className="badge">{t("عرض جديد", "New Offering")}</span>
            <i className="fa-solid fa-sliders icon"></i>
          </div>
          <p className="small-title">{t("إيقاف الخسائر", "STOP OUT")}</p>
          <h3>0%</h3>
          <p className="desc">{t("حافظ على صفقاتك مفتوحة لفترة أطول بمرونة أكبر.", "Keep your trades open longer with more flexibility.")}</p>
        </div>
        <div className="feature-card">
          <span className="line"></span>
          <i className="fa-solid fa-headset icon"></i>
          <p className="small-title">{t("دعم مخصص", "DEDICATED SUPPORT")}</p>
          <h3>24/5</h3>
          <p className="desc">{t("نحن هنا كلما احتجت إلينا.", "We are here whenever you need us.")}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>{t("أطلق العنان لإمكانياتك من خلال التعلم والنمو والمجتمع.", "Unlock your potential through learning, growth, and community.")}</h2>
          <Link to="/register" className="cta-btn">{t("ابدأ الآن", "Start Now")}</Link>
        </div>
      </section>

      {/* Platforms Intro */}
      <section className="platforms-intro">
        <div className="platforms-title">
          <h2>
            {t("استكشف محتوانا التعليمي", "Explore Our Learning Content")}
            <span></span>
          </h2>
        </div>
        <div className="platforms-text">
          <div className="line"></div>
          <p>{t("اكتشف مجموعة واسعة من الجلسات التعليمية العملية المصممة لمساعدتك على تطوير مهارات جديدة وتحقيق أهدافك والنمو بثقة.", "Discover a wide range of practical learning sessions designed to help you develop new skills, achieve your goals, and grow with confidence.")}</p>
        </div>
      </section>

      {/* Platform Showcase */}
      <section className="platform-showcase">
        <div className="showcase-image reveal">
          <img src="image/Screenshot_2026-06-26_043217-removebg-preview.png" alt="" />
        </div>
        <div className="features-slider"></div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-wrapper">
          <div className="stat-card">
            <i className="fa-solid fa-building-shield"></i>
            <h2 className="stat-number">5</h2>
            <h3 className="stat-title">{t("التراخيص", "Regulations")}</h3>
            <p className="stat-desc">{t("مرخصة في عدة جهات قضائية مع حماية قوية للمستثمرين.", "Regulated across multiple jurisdictions with strong investor protection.")}</p>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-star"></i>
            <h2 className="stat-number">5-star</h2>
            <h3 className="stat-title">{t("خدمة العملاء", "Customer Service")}</h3>
            <p className="stat-desc">{t("فريق دعم متعدد اللغات متاح 24/5 بجودة خدمة استثنائية.", "Multilingual support team available 24/5 with exceptional service quality.")}</p>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-award"></i>
            <h2 className="stat-number">142+</h2>
            <h3 className="stat-title">{t("الجوائز", "Awards")}</h3>
            <p className="stat-desc">{t("معترف بها عالمياً مع أكثر من 142 جائزة دولية.", "Recognized globally with more than 142 international awards.")}</p>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-user"></i>
            <h2 className="stat-number">17,200,000</h2>
            <h3 className="stat-title">{t("حسابات العملاء", "Client Accounts")}</h3>
            <p className="stat-desc">{t("تقديم خدمات التداول عبر الإنترنت منذ 1999 في أكثر من 170 دولة.", "Providing online trading services since 1999 across 170+ countries.")}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <p>{t("تحتاج مساعدة؟ تفضل بزيارة", "Need Help? Visit our")} <a href="#">{t("قسم المساعدة", "Help Section")}</a></p>
        </div>
        <div className="footer-middle">
          <div className="brand">
            <h3>F</h3>
            <span>{t("© 1999 - 2026 Everest Academy", "© 1999 - 2026 Everest Academy")}</span>
          </div>
          <div className="social">
            <a href="#">f</a>
            <a href="#">in</a>
            <a href="#">▶</a>
            <a href="#">✈</a>
            <a href="#">𝕏</a>
            <a href="#">◎</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            {t("المزيد من طرق التواصل:", "More ways to reach us:")}
            <a href="#"></a>,
            {t("اتصل", "call")} +44 (0) 20 7776 9720 (24/5)
            <a href="#"></a>
          </p>
        </div>
      </footer>

      {/* Disclaimer */}
      <section className="disclaimer">
        <div className="disclaimer-grid">
          <p><strong>{t("تداول بمسؤولية:", "Trade Responsibly:")}</strong> {t("تداول الأدوات المالية يحمل درجة عالية من المخاطرة...", "Trading financial instruments carry a high level...")}</p>
          <p>{t("Everest Academy هي علامة تجارية مسجلة تستخدم بموجب...", "Everest Academy is a registered trademark utilised under...")}</p>
          <p>{t("Everest Academy لا تقدم خدمات للمقيمين في...", "Everest Academy doesn't offer services to residents...")}</p>
        </div>
      </section>

      {/* AI Chat */}
      <div className="everest-ai-system">
        <div className="ai-chat-trigger" id="chatTrigger" onClick={() => setChatOpen(true)}>
          <div className="ai-ring"></div>
          <div className="ai-core">
            <span>AI</span>
          </div>
        </div>
        <div className={`ai-chat-window${chatOpen ? "" : ""}`} id="chatWindow" style={{ display: chatOpen ? "flex" : "none" }}>
          <div className="chat-header">
            <button className="chat-close-btn" id="chatClose" title={t("إغلاق", "Close")} onClick={() => setChatOpen(false)}>
              <svg viewBox="0 0 24 24">
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
              </svg>
            </button>
            <div className="chat-header-profile">
              <div className="chat-info" style={{ textAlign: "left", marginRight: 10 }}>
                <h5>{t("مساعد إيفرست الذكي", "Everest AI Assistant")}</h5>
                <span>{t("متصل الآن", "Online Now")}</span>
              </div>
              <div className="cute-robot-icon" style={{ transform: "scale(0.9)" }}>
                <div className="robot-eye"></div>
                <div className="robot-eye"></div>
              </div>
            </div>
          </div>
          <div className="chat-body">
            <div className="chat-bubble ai">
              {t("مرحباً بك في Everest Academy! أنا مستشارك هنا لمساعدتك في خطة التسجيل وتوجيهك لمسارك المالي. اسألني عن أي شيء!", "Welcome to Everest Academy! I am your advisor here to help you with your registration plan and guide you on your financial path. Ask me anything!")}
            </div>
          </div>
          <div className="chat-footer">
            <div className="chat-footer-input-wrapper">
              <input type="text" placeholder={t("اكتبي سؤالكِ هنا...", "Type your question here...")} id="chatInput" />
              <button className="chat-send-arrow" id="sendMessageBtn">
                <svg viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
