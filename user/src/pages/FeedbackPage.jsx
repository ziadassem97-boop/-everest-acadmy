import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../LangContext";
import AppNavbar from "../components/AppNavbar";

export default function FeedbackPage() {
  const { t, dir } = useLang();
  const [chatOpen, setChatOpen] = useState(false);
  const [modalImg, setModalImg] = useState(null);
  const navbarRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (navbarRef.current) {
        navbarRef.current.classList.toggle("scrolled", window.scrollY > 40);
      }
    };
    window.addEventListener("scroll", onScroll);

    const counters = document.querySelectorAll(".feedback-page .counter");
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = +counter.dataset.target;
          let count = 0;
          const speed = target / 80;
          const update = () => {
            count += speed;
            if (count < target) {
              counter.innerText = Math.floor(count);
              requestAnimationFrame(update);
            } else {
              if (target === 500000) counter.innerText = "500,000+";
              else if (target === 95) counter.innerText = "95%";
              else counter.innerText = target;
            }
          };
          update();
          observerRef.current.unobserve(counter);
        }
      });
    });
    counters.forEach((c) => observerRef.current.observe(c));

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const proofs = ["feed1.png", "feed2.png", "feed3.png", "feed4.png", "feed5.png"];

  return (
    <div className="feedback-page">
      <AppNavbar />

      <section className="feedback-hero">
        <video autoPlay muted loop playsInline className="hero-video">
          <source src="video/IMG_1492.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span>{t("قصص النجاح", "SUCCESS STORIES")}</span>
          <h1>{t("قصص حقيقية.", "Real Stories.")}<br />{t("نتائج حقيقية.", "Real Results.")}</h1>
          <p>{t("اكتشف كيف ساعدت Everest Academy الأعضاء على تعلم مهارات جديدة وبناء شبكات أقوى وفتح فرص جديدة للنمو.", "Discover how Everest Academy has helped members learn new skills, build stronger networks and unlock new opportunities for growth.")}</p>
        </div>
      </section>

      <section className="feedback-section">
        <div className="feedback-header">
          <span>{t("آراء المجتمع", "COMMUNITY FEEDBACK")}</span>
          <h2>{t("موثوق من قبل آلاف الأعضاء", "Trusted By Thousands Of Members")}</h2>
        </div>
        <div className="feedback-grid">
          <div className="reviews-side">
            <div className="review-card">
              <div className="review-user">
                <img src="image/yosry.png" alt="" />
                <div><h4>Ahmed Mohamed</h4><span>{t("طالب Media Buying", "Media Buying Student")}</span></div>
              </div>
              <div className="stars">★★★★★</div>
              <p>{t("أفضل مجتمع تعليمي انضممت إليه. الدعم والتوجيه ساعداني على التحسن بشكل أسرع مما توقعت.", "The best learning community I've joined. The support and mentorship helped me improve much faster than expected.")}</p>
            </div>
            <div className="review-card">
              <div className="review-user">
                <img src="image/omar.png" alt="" />
                <div><h4>Sara Ali</h4><span>{t("طالب Trading", "Trading Student")}</span></div>
              </div>
              <div className="stars">★★★★★</div>
              <p>{t("محتوى عملي، دعم رائع وبيئة تعليمية احترافية للغاية.", "Practical content, amazing support and a very professional learning environment.")}</p>
            </div>
          </div>
          <div className="feedback-form">
            <span>{t("شارك تجربتك", "SHARE YOUR EXPERIENCE")}</span>
            <h3>{t("اترك تقييماً", "Leave A Review")}</h3>
            <form>
              <input type="text" placeholder={t("اسمك", "Your Name")} />
              <textarea placeholder={t("اكتب رأيك...", "Write your feedback...")}></textarea>
              <button type="submit">{t("إرسال التقييم", "Submit Review")}</button>
            </form>
          </div>
        </div>
      </section>

      <section className="proofs">
        <div className="proofs-header">
          <span>{t("إثباتات النجاح", "SUCCESS PROOFS")}</span>
          <h2>{t("إنجازات المجتمع", "Community Achievements")}</h2>
          <p>{t("لقطات شاشة حقيقية شاركها أعضاؤنا تعرض إنجازاتهم ونموهم.", "Real screenshots shared by our members showcasing their achievements and growth.")}</p>
        </div>
        <div className="proofs-slider">
          {proofs.map((p, i) => (
            <img key={i} src={`image/${p}`} className="proof-img" alt="" onClick={() => setModalImg(`image/${p}`)} />
          ))}
        </div>
      </section>

      {modalImg && (
        <div className="proof-modal active" onClick={() => setModalImg(null)}>
          <span className="close-modal">&times;</span>
          <img className="modal-image" src={modalImg} alt="" />
        </div>
      )}

      <section className="stats-section">
        <div className="stats-header">
          <span>{t("مجتمعنا", "OUR COMMUNITY")}</span>
          <h2>{t("ننمو معاً، نحقق المزيد", "Growing Together, Achieving More")}</h2>
        </div>
        <div className="stats-grid">
          <div className="stat-item"><h3 className="counter" data-target="500000">0</h3><p>{t("الأعضاء النشطون", "Active Members")}</p></div>
          <div className="stat-item"><h3 className="counter" data-target="4">0</h3><p>{t("الكورسات المميزة", "Premium Courses")}</p></div>
          <div className="stat-item"><h3 className="counter" data-target="10">0</h3><p>{t("المستويات", "Rank Levels")}</p></div>
          <div className="stat-item"><h3 className="counter" data-target="95">0</h3><p>{t("نسبة الرضا", "Satisfaction Rate")}</p></div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-top"><p>{t("تحتاج مساعدة؟ تفضل بزيارة", "Need Help? Visit our")} <a href="#">{t("قسم المساعدة", "Help Section")}</a></p></div>
        <div className="footer-middle">
          <div className="brand"><h3>F</h3><span>{t("© 1999 - 2026 Everest Academy", "© 1999 - 2026 Everest Academy")}</span></div>
          <div className="social">
            <a href="#">f</a><a href="#">in</a><a href="#">▶</a><a href="#">✈</a><a href="#">𝕏</a><a href="#">◎</a>
          </div>
        </div>
        <div className="footer-bottom"><p>{t("المزيد من طرق التواصل:", "More ways to reach us:")} <a href="#"></a>, {t("اتصل", "call")} +44 (0) 20 7776 9720 (24/5) <a href="#"></a></p></div>
      </footer>

      <section className="disclaimer">
        <div className="disclaimer-grid">
          <p><strong>{t("تداول بمسؤولية:", "Trade Responsibly:")}</strong> {t("تداول الأدوات المالية يحمل درجة عالية من المخاطرة...", "Trading financial instruments carry a high level...")}</p>
          <p>{t("Everest Academy هي علامة تجارية مسجلة تستخدم بموجب...", "Everest Academy is a registered trademark utilised under...")}</p>
          <p>{t("Everest Academy لا تقدم خدمات للمقيمين في...", "Everest Academy doesn't offer services to residents...")}</p>
        </div>
      </section>

      <div className="everest-ai-system">
        <div className="ai-chat-trigger" onClick={() => setChatOpen(true)}>
          <div className="ai-ring"></div>
          <div className="ai-core"><span>AI</span></div>
        </div>
        <div className="ai-chat-window" style={{ display: chatOpen ? "flex" : "none" }}>
          <div className="chat-header">
            <button className="chat-close-btn" onClick={() => setChatOpen(false)}>
              <svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" /></svg>
            </button>
            <div className="chat-header-profile">
              <div className="chat-info" style={{ textAlign: "left", marginRight: 10 }}>
                <h5>{t("مساعد إيفرست الذكي", "Everest AI Assistant")}</h5><span>{t("متصل الآن", "Online Now")}</span>
              </div>
            </div>
          </div>
          <div className="chat-body">
            <div className="chat-bubble ai">{t("مرحباً بك في Everest Academy! أنا مستشارك هنا لمساعدتك في خطة التسجيل وتوجيهك لمسارك المالي. اسألني عن أي شيء!", "Welcome to Everest Academy! I am your advisor here to help you with your registration plan and guide you on your financial path. Ask me anything!")}</div>
          </div>
          <div className="chat-footer">
            <div className="chat-footer-input-wrapper">
              <input type="text" placeholder={t("اكتبي سؤالكِ هنا...", "Type your question here...")} />
              <button className="chat-send-arrow"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
