import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useLang } from "../LangContext";
import { api } from "../App";
import AppNavbar from "../components/AppNavbar";

export default function CourseViewPage() {
  const { t, dir } = useLang();
  const { id } = useParams();
  const { user, login, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [course, setCourse] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [buying, setBuying] = useState(false);
  const [err, setErr] = useState("");
  const [gateways, setGateways] = useState([]);
  const [balanceError, setBalanceError] = useState("");

  useEffect(() => {
    api(`/api/courses/${id}`).then(setCourse).catch(() => setErr(t("الكورس غير موجود", "Course not found")));
  }, [id]);

  useEffect(() => {
    api("/api/payment-gateways/active").then((data) => {
      if (Array.isArray(data)) setGateways(data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (user && course) {
      api(`/api/courses/my?userId=${user.id}&courseId=${id}`).then((data) => {
        const active = data.filter(e => e.status === "approved" || e.status === "pending");
        if (active.length) setEnrollment(active[0]);
        else setEnrollment(null);
      }).catch(() => {});
    }
  }, [user, course, id]);

  const buyCourse = async (method = "emoney") => {
    if (!user) { nav("/login"); return; }
    if (user.role === "registration") {
      alert(t("حسابك من نوع Registration. يرجى الترقية إلى Student من صفحة الملف الشخصي أولاً.", "Your account is Registration type. Please upgrade to Student from your profile page first."));
      nav("/profile");
      return;
    }
    setBuying(true);
    try {
      const result = await api(`/api/courses/${id}/purchase`, {
        method: "POST", body: JSON.stringify({ userId: user.id, payment_method: method })
      });
      setEnrollment(result);
      if (method === "emoney" && (result.status === "pending" || result.status === "approved")) {
        user.e_money = (user.e_money || 0) - (course.price || 0);
        login(user);
      }
    } catch (e) {
      if (e.upgradeRequired) {
        alert(t("حسابك من نوع Registration. يرجى الترقية إلى Student من صفحة الملف الشخصي أولاً.", "Your account is Registration type. Please upgrade to Student from your profile page first."));
        nav("/profile");
      } else {
        alert(t("خطأ: ", "Error: ") + (e.message || t("فشل عملية الشراء", "Purchase failed")));
      }
    }
    setBuying(false);
  };

  // Screen recording protection: block Print Screen, Ctrl+Shift+S, etc.
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) { e.preventDefault(); alert(t("لا يُسمح بالتقاط الشاشة", "Screenshots are not allowed")); return false; }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "s" || e.key === "S")) { e.preventDefault(); alert(t("لا يُسمح بتسجيل الشاشة", "Screen recording is not allowed")); return false; }
      if (e.ctrlKey && e.key === "p") { e.preventDefault(); return false; }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Block context menu (right-click) on the video container only
  const blockCtx = (e) => { e.preventDefault(); return false; };

  if (err) return <div className="courses-body" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}><p style={{color:"#ff5b5b"}}>{err}</p></div>;
  if (!course) return <div className="courses-body" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}><p style={{color:"#9a95b0"}}>{t("جاري التحميل...", "Loading...")}</p></div>;

  const isFree = course.is_free || course.price === 0;
  const isApproved = enrollment?.status === "approved";
  const isPending = enrollment?.status === "pending";
  const isEnrolled = isApproved || (isFree && enrollment);
  const canWatchAll = isEnrolled || isFree;
  const isRegistration = user?.role === "registration";

  const allLessons = (course.topics || []).flatMap((t) => (t.lessons || []).map((l) => ({ ...l, topicTitle: t.title_ar || t.title })));
  const current = playing || allLessons[0] || null;
  const idx = allLessons.findIndex((l) => l.id === current?.id);
  const isYoutube = (url) => url && (url.includes("youtube.com") || url.includes("youtu.be"));
  const getYtEmbed = (url) => { const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/); return m ? `https://www.youtube.com/embed/${m[1]}` : null; };
  const videoSrc = current?.video_url ? (isYoutube(current.video_url) ? getYtEmbed(current.video_url) : current.video_url) : null;

  return (
    <div className="courses-body">
      <AppNavbar />
      <main className="courses-main">
        <div style={{background:"rgba(20,16,36,.6)",border:"1px solid rgba(255,255,255,.05)",borderRadius:20,padding:24,marginBottom:20}}>
          <h2 style={{fontSize:"1.8rem",fontWeight:800,background:"linear-gradient(135deg,#fdfbfb,#e2c275,#b38728)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8}}>
            {course.title_ar || course.title}
          </h2>
          <p style={{color:"#9a95b0",fontSize:14}}>{course.description_ar || course.description}</p>
          <div style={{display:"flex",gap:15,marginTop:15,fontSize:13,color:"#9a95b0"}}>
            <span><strong style={{color:"#e2c275"}}>{t("المستوى:", "Level:")}</strong> {course.difficulty === "beginner" ? t("مبتدئ", "Beginner") : course.difficulty === "intermediate" ? t("متوسط", "Intermediate") : t("متقدم", "Advanced")}</span>
            <span><strong style={{color:"#e2c275"}}>{t("السعر:", "Price:")}</strong> {isFree ? t("مجاني", "Free") : `${course.price} E-Money`}</span>
            <span><strong style={{color:"#e2c275"}}>{t("الدروس:", "Lessons:")}</strong> {allLessons.length}</span>
          </div>
        </div>

        {isRegistration && !isEnrolled && (
          <div style={{background:"rgba(179,135,40,.1)",border:"1px solid rgba(179,135,40,.2)",borderRadius:14,padding:16,marginBottom:20,color:"#e2c275",fontSize:14}}>
            ⚠️ {t("حسابك من نوع Registration. يمكنك مشاهدة الدروس المجانية فقط.", "Your account is Registration type. You can only watch free lessons.")}
            <Link to="/profile" style={{color:"#fff",fontWeight:700,display:"block",marginTop:8}}>{t("طلب ترقية إلى Student", "Request Upgrade to Student")}</Link>
          </div>
        )}

        {isPending && (
          <div style={{background:"rgba(254,212,0,.08)",border:"1px solid rgba(254,212,0,.2)",borderRadius:14,padding:16,marginBottom:20,color:"#fed400",fontSize:14}}>
            ⏳ {t("تم تقديم طلب الشراء. في انتظار موافقة الادمن ...", "Purchase request submitted. Waiting for admin approval...")}
          </div>
        )}

        {isApproved && (
          <div style={{background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.2)",borderRadius:14,padding:16,marginBottom:20,color:"#22c55e",fontSize:14}}>
            ✅ {t("تم تفعيل الكورس. يمكنك مشاهدة جميع الدروس.", "Course activated. You can watch all lessons.")}
          </div>
        )}

        {!isEnrolled && !isPending && !isFree && user?.role === "student" && (
          <div style={{textAlign:"center",padding:"16px 0",marginBottom:20}}>
            {(user?.e_money || 0) < course.price && (
              <div style={{background:"rgba(255,91,91,.1)",border:"1px solid rgba(255,91,91,.2)",borderRadius:14,padding:12,marginBottom:16,color:"#ff5b5b",fontSize:13}}>
                ⚠️ {t("رصيد E-Money الحالي", "Current E-Money balance")} ({user?.e_money || 0}) {t("لا يكفي لشراء هذا الكورس", "is not enough to purchase this course")} ({course.price}). {t("يرجى شحن رصيدك أو استخدام طريقة دفع أخرى.", "Please top up your balance or use another payment method.")}
              </div>
            )}
            {balanceError && <p style={{color:"#ff5b5b",fontSize:13,marginBottom:10}}>{balanceError}</p>}
            <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
              <button onClick={async () => {
                if ((user?.e_money || 0) < course.price) { setBalanceError(t("رصيد E-Money غير كافٍ", "Insufficient E-Money balance")); return; }
                setBalanceError(""); await buyCourse("emoney");
              }} disabled={buying}
                style={{padding:"14px 26px",background:"linear-gradient(135deg,#b38728,#e2c275)",border:"none",borderRadius:14,color:"#05030a",fontWeight:800,fontSize:14,cursor:"pointer",opacity:buying?0.6:1}}>
                {buying ? t("جاري الشراء...", "Purchasing...") : `💳 ${t("اشتري بـ", "Buy for")} ${course.price} E-Money`}
              </button>
              <button onClick={() => buyCourse("cash")} disabled={buying}
                style={{padding:"14px 26px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",opacity:buying?0.6:1}}>
                💵 {t("دفع كاش (للادمن)", "Cash Payment (for Admin)")}
              </button>
              {gateways.some(g => g.type === "vodafone") && (
                <Link to={`/courses/${id}/vodafone-cash`}
                  style={{padding:"14px 26px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",textDecoration:"none",display:"inline-flex",alignItems:"center"}}>
                  📱 {t("فودافون كاش", "Vodafone Cash")}
                </Link>
              )}
              {gateways.some(g => g.type === "instapay") && (
                <Link to={`/courses/${id}/instapay`}
                  style={{padding:"14px 26px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",textDecoration:"none",display:"inline-flex",alignItems:"center"}}>
                  🏦 {t("انستاباي", "InstaPay")}
                </Link>
              )}
            </div>
            <p style={{color:"#9a95b0",fontSize:12,marginTop:8}}>{t("رصيدك الحالي:", "Your current balance:")} {user?.e_money || 0} E-Money</p>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:20,alignItems:"start"}}>
          <div style={{background:"rgba(20,16,36,.6)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16,padding:16}}>
            <h3 style={{fontSize:14,fontWeight:700,color:"#e2c275",marginBottom:12,letterSpacing:1}}>{t("محتوى الكورس", "COURSE CONTENT")}</h3>
            {(course.topics || []).map((topic) => (
              <div key={topic.id} style={{marginBottom:12}}>
                <p style={{fontSize:11,fontWeight:700,color:"#9a95b0",marginBottom:6,padding:"0 8px"}}>{topic.title_ar || topic.title}</p>
                {(topic.lessons || []).map((lesson) => {
                  const locked = !canWatchAll && !lesson.is_free;
                  return (
                    <button key={lesson.id} onClick={() => !locked && setPlaying(lesson)} disabled={locked}
                      style={{width:"100%",textAlign:"right",padding:"8px 12px",borderRadius:8,border:"none",fontSize:13,cursor:locked?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:8,marginBottom:4,
                        background:current?.id===lesson.id?"linear-gradient(135deg,#b38728,#e2c275)":"transparent",
                        color:current?.id===lesson.id?"#05030a":locked?"#555":"#d1cfe2",
                        fontWeight:current?.id===lesson.id?700:400
                      }}>
                      <span>{locked ? "🔒" : current?.id === lesson.id ? "▶" : "🎬"}</span>
                      <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:"right"}}>{lesson.title_ar || lesson.title}</span>
                      {lesson.is_free && <span style={{fontSize:10,background:"rgba(254,212,0,.15)",color:"#fed400",padding:"1px 6px",borderRadius:4}}>{t("مجاني", "FREE")}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{background:"rgba(20,16,36,.6)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16,overflow:"hidden",position:"relative"}}>
            <div onContextMenu={blockCtx} style={{aspectRatio:"16/9",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",userSelect:"none",WebkitUserSelect:"none"}}>
              {current && !canWatchAll && !current.is_free ? (
                <div style={{textAlign:"center",color:"#555",padding:30}}>
                  <p style={{fontSize:48,marginBottom:12}}>🔒</p>
                  <p style={{fontWeight:700,color:"#fff"}}>{t("هذا الدرس غير متاح", "This lesson is not available")}</p>
                  <p style={{fontSize:13,color:"#888",marginTop:6}}>{t("قم بشراء الكورس للمشاهدة الكاملة", "Purchase the course for full access")}</p>
                </div>
              ) : videoSrc ? (
                isYoutube(current.video_url) ? (
                  <iframe src={videoSrc} style={{width:"100%",height:"100%",aspectRatio:"16/9"}} allowFullScreen title="video" />
                ) : (
                  <video src={videoSrc} controls controlsList="nodownload noremoteplayback" disablePictureInPicture style={{width:"100%",height:"100%"}} autoPlay />
                )
              ) : (
                <div style={{color:"#555",textAlign:"center",padding:30}}>
                  <p style={{fontSize:48,marginBottom:12}}>🎬</p>
                  <p style={{fontSize:14}}>{t("هذا الدرس لا يحتوي على فيديو", "This lesson has no video")}</p>
                </div>
              )}
              {/* Watermark overlay */}
              {videoSrc && canWatchAll && user && (
                <div style={{
                  position:"absolute",top:0,left:0,right:0,bottom:0,
                  pointerEvents:"none",zIndex:10,
                  display:"flex",flexWrap:"wrap",alignContent:"flex-start",justifyContent:"center",
                  overflow:"hidden",opacity:0.15,fontSize:14,fontWeight:700,color:"#fff",
                  padding:"10px 0"
                }}>
                  {Array.from({length:40}).map((_,i) => (
                    <span key={i} style={{margin:"8px 16px",whiteSpace:"nowrap",transform:"rotate(-15deg)"}}>{user.email || user.full_name} — {user.email || user.full_name} —</span>
                  ))}
                </div>
              )}
            </div>
            {current && (
              <div style={{padding:16,display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid rgba(255,255,255,.05)"}}>
                <div>
                  <p style={{fontWeight:600,color:"#fff",fontSize:14}}>{current.title_ar || current.title}</p>
                  <p style={{fontSize:12,color:"#9a95b0"}}>{current.topicTitle}</p>
                </div>
                <div style={{display:"flex",gap:8}}>
                  {idx > 0 && <button onClick={() => setPlaying(allLessons[idx-1])} style={{padding:"8px 16px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.05)",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:13}}>{t("السابق", "Previous")}</button>}
                  {idx < allLessons.length-1 && <button onClick={() => setPlaying(allLessons[idx+1])} style={{padding:"8px 16px",background:"linear-gradient(135deg,#b38728,#e2c275)",border:"none",borderRadius:8,color:"#05030a",cursor:"pointer",fontWeight:700,fontSize:13}}>{t("التالي", "Next")}</button>}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
