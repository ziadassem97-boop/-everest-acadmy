import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const api2 = async (path, opts = {}) => {
  const headers = { "Content-Type": "application/json" };
  const uid = localStorage.getItem("everest_user");
  const stoken = localStorage.getItem("everest_session_token");
  if (uid && stoken) { try { headers["x-user-id"] = JSON.parse(uid).id; headers["x-session-token"] = stoken; } catch {} }
  const res = await fetch(path, { ...opts, headers: { ...headers, ...opts.headers } });
  if (!res.ok) { const body = await res.json().catch(() => ({})); if (body.session_expired) { localStorage.removeItem("everest_user"); localStorage.removeItem("everest_session_token"); window.location.href = "/login"; } throw new Error(body.error || `HTTP ${res.status}`); }
  return res.json();
};

export default function VodafoneCashPurchasePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [course, setCourse] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [gateways, setGateways] = useState([]);

  useEffect(() => {
    api2(`/api/courses/${id}`).then(setCourse).catch(() => nav("/courses"));
    api2("/api/payment-gateways/active").then((data) => {
      if (Array.isArray(data)) setGateways(data.filter(g => g.type === "vodafone"));
    }).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (user && id) {
      api2(`/api/courses/my?userId=${user.id}&courseId=${id}`).then((data) => {
        const active = data.filter(e => e.status === "approved" || e.status === "pending");
        if (active.length) { setDone(true); setErr("existing"); }
      }).catch(() => {});
    }
  }, [user, id]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { setErr("من فضلك اختر صورة التحويل"); return; }
    setUploading(true); setErr("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("فشل رفع الصورة");
      const { url } = await uploadRes.json();

      await api2(`/api/courses/${id}/purchase`, {
        method: "POST",
        body: JSON.stringify({ userId: user.id, payment_method: "vodafone", payment_proof: url })
      });

      setDone(true);
    } catch (e) {
      setErr(e.message || "حدث خطأ أثناء عملية الشراء");
    }
    setUploading(false);
  };

  if (!course) return <div className="courses-body" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}><p style={{color:"#9a95b0"}}>Loading...</p></div>;

  if (done) return (
    <div className="courses-body" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
      <div style={{textAlign:"center",padding:40}}>
        <p style={{fontSize:60,marginBottom:16}}>✅</p>
        <h2 style={{color:"#fff",marginBottom:8}}>{err === "existing" ? "أنت مسجل بالفعل" : "تم إرسال طلب الشراء"}</h2>
        <p style={{color:"#9a95b0",marginBottom:20}}>{err === "existing" ? "هذا الكورس مسجل لك بالفعل أو في انتظار الموافقة." : "في انتظار موافقة الادمن. سيتم تفعيل الكورس بعد التأكد من الدفع."}</p>
        <Link to="/courses" style={{padding:"12px 24px",background:"linear-gradient(135deg,#b38728,#e2c275)",borderRadius:12,color:"#05030a",fontWeight:700,textDecoration:"none"}}>العودة للكورسات</Link>
      </div>
    </div>
  );

  return (
    <div className="courses-body">
      <header className="courses-header">
        <div className="courses-nav">
          <Link to={`/courses/${id}`} className="courses-brand"><h1>EVEREST ACADEMY</h1></Link>
        </div>
      </header>

      <main className="courses-main" style={{maxWidth:600,margin:"0 auto",padding:"40px 0"}}>
        <div style={{background:"rgba(20,16,36,.6)",border:"1px solid rgba(255,255,255,.05)",borderRadius:20,padding:30}}>
          <h2 style={{color:"#e2c275",fontSize:20,marginBottom:20,textAlign:"center"}}>💳 شراء الكورس عبر فودافون كاش</h2>

          <div style={{background:"rgba(255,255,255,.03)",borderRadius:14,padding:20,marginBottom:24}}>
            <p style={{color:"#fff",fontWeight:700,fontSize:16,marginBottom:8}}>{course.title_ar || course.title}</p>
            <p style={{color:"#e2c275",fontSize:24,fontWeight:800}}>{course.price} EGP</p>
          </div>

          <div style={{background:"rgba(254,212,0,.06)",border:"1px solid rgba(254,212,0,.15)",borderRadius:14,padding:16,marginBottom:24}}>
            <p style={{color:"#fed400",fontSize:13,fontWeight:700,marginBottom:6}}>📱 بيانات الدفع عبر فودافون كاش:</p>
            <p style={{color:"#9a95b0",fontSize:14}}>يرجى تحويل المبلغ إلى أحد الأرقام التالية ثم رفع صورة التحويل:</p>
            {gateways.length > 0 ? gateways.map((g, i) => (
              <div key={g.id} style={{background:"rgba(255,255,255,.03)",borderRadius:10,padding:"10px 14px",marginTop:8}}>
                {g.label && <p style={{color:"#9a95b0",fontSize:12,marginBottom:2}}>{g.label}</p>}
                <p style={{color:"#fff",fontSize:20,fontWeight:800,letterSpacing:1,direction:"ltr",textAlign:"center"}}>{g.value}</p>
              </div>
            )            ) : (
              <div style={{textAlign:"center",padding:20}}>
                <p style={{fontSize:40,marginBottom:8}}>⚠️</p>
                <p style={{color:"#ff5b5b",fontSize:14,fontWeight:600}}>هذه الخدمة غير متوفرة حالياً</p>
                <p style={{color:"#9a95b0",fontSize:13,marginTop:4}}>لم يتم إضافة وسيلة دفع فودافون كاش بعد. يرجى التواصل مع الإدارة.</p>
              </div>
            )}
          </div>

          {err && <p style={{color:"#ff5b5b",fontSize:13,marginBottom:12,textAlign:"center"}}>{err}</p>}

          {gateways.length > 0 && (
            <form onSubmit={handleUpload}>
              <div style={{marginBottom:20}}>
                <label style={{color:"#9a95b0",fontSize:13,display:"block",marginBottom:8}}>صورة التحويل (Screenshot):</label>
                <div style={{border:"2px dashed rgba(255,255,255,.1)",borderRadius:14,padding:20,textAlign:"center",cursor:"pointer",background:"rgba(255,255,255,.02)"}}
                  onClick={() => document.getElementById("proofInput").click()}>
                  <p style={{fontSize:40,marginBottom:8}}>📸</p>
                  <p style={{color:"#9a95b0",fontSize:13}}>{file ? file.name : "اضغط لاختيار صورة التحويل"}</p>
                </div>
                <input id="proofInput" type="file" accept="image/*" style={{display:"none"}} onChange={(e) => setFile(e.target.files[0])} />
              </div>

              <button type="submit" disabled={uploading}
                style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#b38728,#e2c275)",border:"none",borderRadius:14,color:"#05030a",fontWeight:800,fontSize:16,cursor:"pointer",opacity:uploading?0.6:1}}>
                {uploading ? "جاري رفع الصورة..." : "تأكيد الدفع وإرسال الطلب"}
              </button>
            </form>
          )}

          <Link to={`/courses/${id}`} style={{display:"block",textAlign:"center",marginTop:16,color:"#9a95b0",fontSize:13}}>الرجوع</Link>
        </div>
      </main>
    </div>
  );
}
