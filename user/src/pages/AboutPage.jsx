import { Link } from "react-router-dom";
import { useLang } from "../LangContext";
import { useTheme } from "../ThemeContext";
import PublicNavbar from "../components/PublicNavbar";
import CustomerServiceFooter from "../components/CustomerServiceFooter";



export default function AboutPage() {
  const { t, dir } = useLang();
  const { colors: c } = useTheme();

  return (
    <div className="about-page" style={{background: c.bg}}>
      <PublicNavbar active="about" />
      <header className="about-hero">
        <img src="image/stage.png" className="hero-image" alt="" />
        <div className="overlay"></div>
        <div className="hero-content">
          <span>{t("عن إيفرست", "ABOUT EVEREST")}</span>
          <h1>{t("حقق الأعلى.", "Reach Higher.")}<br />{t("مثل إيفرست.", "Like Everest.")}</h1>
          <p>{t("تعلم مهارات قيمة، ابنِ مجتمعات قوية، وافتح فرصاً جديدة للنمو.", "Learn valuable skills, build strong communities and unlock new opportunities for growth.")}</p>
        </div>
      </header>

      <section className="online-learning">
        <div className="online-content">
          <span>{t("كيف نعمل", "HOW WE OPERATE")}</span>
          <h2>{t("تعلم في أي مكان.", "Learn Anywhere.")}<br />{t("انمو في كل مكان.", "Grow Everywhere.")}</h2>
          <p>{t("نعمل من خلال نظام تعليمي رقمي بالكامل، مما يسمح للأعضاء بالوصول إلى التعليم والتوجيه والدعم من أي مكان.", "We operate through a fully digital learning system, allowing members to access education, mentorship and support from anywhere.")}</p>
          <p>{t("بينما يتم تقديم برامجنا عبر الإنترنت، ننظم بانتظام فعاليات وورش عمل شخصية يتم الإعلان عنها مسبقاً. توفر هذه اللقاءات فرصاً للتواصل مع الموجهين والخبراء والأعضاء الآخرين مع بناء علاقات قيمة.", "While our programs are delivered online, we regularly organize in-person events and workshops announced in advance. These gatherings provide opportunities to connect with mentors, experts and fellow members while building valuable relationships.")}</p>
        </div>
        <div className="online-image">
          <img src="image/online.png" alt={t("مجتمع إيفرست", "Everest Community")} />
        </div>
      </section>

      <section className="why-everest">
        <div className="why-left">
          <span className="section-tag">{t("لماذا إيفرست", "WHY EVEREST")}</span>
          <h2>{t("لماذا يختارنا الناس؟", "Why People Choose Us?")}</h2>
          <p>{t("تجمع Everest Academy بين التعليم العملي والتوجيه الخبير والمجتمع القوي لمساعدة الأفراد الطموحين على تعلم مهارات قيمة والنمو بشكل أسرع وفتح فرص جديدة.", "Everest Academy combines practical education, expert guidance and a strong community to help ambitious individuals learn valuable skills, grow faster and unlock new opportunities.")}</p>
         
        </div>
        <div className="why-right">
          <div className="feature-item">
            <div className="feature-number">01</div>
            <div><h3>{t("تعليم عملي", "Practical Education")}</h3><p>{t("تعلم مهارات واقعية من خلال دورات منظمة مصممة للتطبيق العملي.", "Learn real-world skills through structured courses designed for practical application.")}</p></div>
          </div>
          <div className="feature-item">
            <div className="feature-number">02</div>
            <div><h3>{t("مجتمع قوي", "Strong Community")}</h3><p>{t("تواصل مع الموجهين والأعضاء الذين يدعمون رحلتك التعليمية.", "Connect with mentors and members who support your learning journey.")}</p></div>
          </div>
          <div className="feature-item">
            <div className="feature-number">03</div>
            <div><h3>{t("فرص النمو", "Growth Opportunities")}</h3><p>{t("اكتشف فرصاً جديدة للتطوير الشخصي ونمو القيادة.", "Discover new opportunities for personal development and leadership growth.")}</p></div>
          </div>
          <div className="feature-item">
            <div className="feature-number">04</div>
            <div><h3>{t("الفعاليات والتواصل", "Events & Networking")}</h3><p>{t("انضم إلى ورش العمل والفعاليات التي تساعد في بناء علاقات قيمة.", "Join workshops and events that help build valuable connections.")}</p></div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-middle" style={{direction:"ltr",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 40px",borderBottom:"1px solid #eee"}}>
          <div className="social" style={{display:"flex",gap:16,justifyContent:"center",alignItems:"center"}}>
            <a href="#" style={{width:48,height:48,borderRadius:"50%",background:"linear-gradient(135deg,#0088cc,#005f8f)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",textDecoration:"none",fontSize:20,transition:"transform .2s,box-shadow .2s",boxShadow:"0 4px 15px rgba(0,136,204,.4)"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px) scale(1.1)";e.currentTarget.style.boxShadow="0 8px 25px rgba(0,136,204,.6)";}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 15px rgba(0,136,204,.4)";}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.504-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </a>
            <a href="#" style={{width:48,height:48,borderRadius:"50%",background:"linear-gradient(135deg,#E1306C,#F77737,#FCAF45)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",textDecoration:"none",fontSize:20,transition:"transform .2s,box-shadow .2s",boxShadow:"0 4px 15px rgba(225,48,108,.4)"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px) scale(1.1)";e.currentTarget.style.boxShadow="0 8px 25px rgba(225,48,108,.6)";}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 15px rgba(225,48,108,.4)";}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="#fff" stroke="none"/></svg>
            </a>
            <a href="#" style={{width:48,height:48,borderRadius:"50%",background:"linear-gradient(135deg,#010101,#333)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",textDecoration:"none",fontSize:20,transition:"transform .2s,box-shadow .2s",boxShadow:"0 4px 15px rgba(0,0,0,.4)"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px) scale(1.1)";e.currentTarget.style.boxShadow="0 8px 25px rgba(0,0,0,.6)";}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 15px rgba(0,0,0,.4)";}}>
              <svg width="20" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.89c.3 0 .59.04.86.12V9.01a6.28 6.28 0 00-.86-.06 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.86a8.21 8.21 0 004.86 1.56V6.97a4.84 4.84 0 01-1.1-.28z"/></svg>
            </a>
          </div>
          <div className="brand">
            <h3>E</h3>
            <span>{t("© 1999 - 2026 Everest Academy", "© 1999 - 2026 Everest Academy")}</span>
          </div>
        </div>
        <div className="footer-bottom" style={{textAlign:"center",display:"block",padding:"20px"}}>
          <CustomerServiceFooter />
        </div>
      </footer>

      <section className="disclaimer">
        <div className="disclaimer-grid">
          <p><strong>{t("تداول بمسؤولية:", "Trade Responsibly:")}</strong> {t("تداول الأدوات المالية يحمل درجة عالية من المخاطرة...", "Trading financial instruments carry a high level...")}</p>
          <p>{t("Everest Academy هي علامة تجارية مسجلة تستخدم بموجب...", "Everest Academy is a registered trademark utilised under...")}</p>
          <p>{t("Everest Academy لا تقدم خدمات للمقيمين في...", "Everest Academy doesn't offer services to residents...")}</p>
        </div>
      </section>

    </div>
  );
} 
       
        
       