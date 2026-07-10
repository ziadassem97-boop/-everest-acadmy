import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useLang } from "../LangContext";
import { api } from "../App";
import AppNavbar from "../components/AppNavbar";

export default function ProfilePage() {
  const { user, login, logout } = useAuth();
  const { t, dir } = useLang();
  const nav = useNavigate();
  const loc = useLocation();
  const [commissions, setCommissions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [tab, setTab] = useState("profile");
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", email: "", phone: "" });

  useEffect(() => {
    if (user) { setEditForm({ full_name: user.full_name || "", email: user.email || "", phone: user.phone || "" }); }
  }, [user]);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!uploadRes.ok) throw new Error(t("فشل رفع الصورة", "Image upload failed"));
      const { url } = await uploadRes.json();
      const updated = await api(`/api/users/${user.id}`, { method: "PUT", body: JSON.stringify({ ...user, avatar: url }) });
      login(updated);
    } catch (e) { alert(t("خطأ: ", "Error: ") + (e.message || t("فشل تغيير الصورة", "Failed to change image"))); }
    setUploading(false);
  };

  const saveProfile = async () => {
    try {
      const updated = await api(`/api/users/${user.id}`, { method: "PUT", body: JSON.stringify({ ...user, full_name: editForm.full_name, email: editForm.email, phone: editForm.phone }) });
      login(updated); setEditing(false);
    } catch (e) { alert(t("خطأ: ", "Error: ") + (e.message || t("فشل الحفظ", "Save failed"))); }
  };

  useEffect(() => {
    if (user) {
      api(`/api/mlm/commissions?userId=${user.id}`).then(setCommissions).catch(() => {});
      api(`/api/wallets/transactions`).then(setTransactions).catch(() => {});
      api(`/api/courses/enrollments/list`).then((d) => setEnrollments(d.filter(e => e.user_id === user.id && e.status === "approved"))).catch(() => {});
    }
  }, [user]);

  const copyCode = () => {
    if (user?.referral_code) { navigator.clipboard.writeText(user.referral_code); alert(t("تم نسخ كود الإحالة ✅", "Referral code copied ✅")); }
  };

  const gotoUpgrade = async () => {
    if (!confirm(t("سيتم إرسال طلب ترقية إلى Student Account. هل أنت متأكد؟", "An upgrade request to Student Account will be sent. Are you sure?"))) return;
    try {
      await api("/api/users/upgrade-request", { method: "POST", body: JSON.stringify({ userId: user.id }) });
      alert(t("تم إرسال طلب الترقية! في انتظار موافقة الادمن.", "Upgrade request sent! Waiting for admin approval."));
    } catch (err) { alert(t("خطأ: ", "Error: ") + (err.message || t("فشل إرسال الطلب", "Request failed"))); }
  };

  return (
    <div style={{direction: dir }}>
      <AppNavbar />

      {/* Tabs */}
      <div className="dash-container" style={{marginTop:30}}>
        <div style={{display:"flex",gap:10,marginBottom:25}}>
          {["profile","wallet"].map((tb) => (
            <button key={tb} onClick={() => setTab(tb)}
              style={{padding:"10px 22px",borderRadius:14,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,background:tab===tb?"#111":"#f0f0f0",color:tab===tb?"#d4af37":"#555",transition:".3s"}}
            >{tb === "profile" ? t("الملف الشخصي", "Profile") : t("المحفظة والعمولات", "Wallet & Commissions")}</button>
          ))}
        </div>

        {tab === "profile" && (
          <div className="profile-card">
            {/* Avatar + Photo Button */}
            <div className="profile-avatar" style={{textAlign:"center"}}>
              <div style={{width:160,height:160,borderRadius:"50%",background:"#eee",border:"4px solid #d4af37",display:"flex",alignItems:"center",justifyContent:"center",fontSize:60,fontWeight:700,color:"#999",overflow:"hidden",margin:"0 auto"}}>
                {user?.avatar && user.avatar.trim() ? <img src={user.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : <span style={{fontSize:56,fontWeight:800,color:"#d4af37",lineHeight:1}}>{(user?.full_name || "U")[0].toUpperCase()}</span>}
              </div>
              <label style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:12,padding:"8px 18px",background:"#f0f0f0",borderRadius:20,fontSize:13,fontWeight:600,color:"#555",cursor:"pointer",transition:".2s"}}>
                📸 {uploading ? t("جاري الرفع...", "Uploading...") : t("تغيير الصورة", "Change Photo")}
                <input type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto} disabled={uploading} />
              </label>
            </div>

            <div className="profile-info">
              {/* Name + Role + Edit Button */}
              <div className="profile-top">
                <div>
                  {editing ? (
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      <input value={editForm.full_name} onChange={(e) => setEditForm({...editForm,full_name:e.target.value})} style={{padding:"8px 12px",border:"1px solid #ddd",borderRadius:8,fontSize:16,fontWeight:700}} />
                      <input value={editForm.email} onChange={(e) => setEditForm({...editForm,email:e.target.value})} style={{padding:"8px 12px",border:"1px solid #ddd",borderRadius:8,fontSize:13}} />
                      <input value={editForm.phone} onChange={(e) => setEditForm({...editForm,phone:e.target.value})} style={{padding:"8px 12px",border:"1px solid #ddd",borderRadius:8,fontSize:13}} />
                    </div>
                  ) : (
                    <>
                      <h2>{user?.full_name}</h2>
                      <p style={{color:"#888",fontSize:13,marginTop:2}}>{user?.email}</p>
                      <span className="student-id">ID: {user?.id?.slice(0,8) || "—"}</span>
                    </>
                  )}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
                  <span style={{padding:"8px 16px",borderRadius:999,background:user?.role==="student"?"rgba(212,175,55,.12)":"#fff8dd",color:user?.role==="student"?"#b8860b":"#b48800",fontSize:13,fontWeight:600}}>
                    {user?.role === "student" ? `🎓 ${t("طالب", "Student")}` : `📝 ${t("تسجيل", "Registration")}`}
                  </span>
                  {editing ? (
                    <div style={{display:"flex",gap:4}}>
                      <button onClick={saveProfile} style={{padding:"6px 16px",background:"#d4af37",border:"none",borderRadius:8,fontWeight:700,cursor:"pointer"}}>💾 {t("حفظ", "Save")}</button>
                      <button onClick={() => setEditing(false)} style={{padding:"6px 16px",background:"#eee",border:"none",borderRadius:8,cursor:"pointer"}}>{t("إلغاء", "Cancel")}</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditing(true)} style={{padding:"6px 16px",background:"#f5f5f5",border:"1px solid #ddd",borderRadius:8,fontSize:12,cursor:"pointer"}}>✏️ {t("تعديل البيانات", "Edit Profile")}</button>
                  )}
                  <button onClick={() => { logout(); nav("/login"); }} style={{padding:"6px 16px",background:"#fee",border:"1px solid #fcc",borderRadius:8,fontSize:12,cursor:"pointer",color:"#c00"}}>🚪 {t("تسجيل الخروج", "Logout")}</button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="profile-stats-grid">
                <div className="stat-box"><span>📞 {t("الهاتف", "Phone")}</span><strong>{user?.phone || "—"}</strong></div>
                <div className="stat-box"><span>🏅 {t("الترتيب", "Rank")}</span><strong>{user?.rank || "Star"}</strong></div>
                <div className="stat-box"><span>💰 E-Money</span><strong>{user?.e_money || 0}</strong></div>
                <div className="stat-box"><span>📊 {t("النقاط", "Points")}</span><strong>{user?.academic_points || 0}</strong></div>
                <div className="stat-box"><span>👥 {t("المباشرون", "Directs")}</span><strong>{user?.direct_count || 0}</strong></div>
                <div className="stat-box"><span>📊 {t("مبيعات الفريق", "Team Sales")}</span><strong>{user?.total_team_sales || 0}</strong></div>
                <div className="stat-box"><span>📅 {t("تاريخ الانضمام", "Joined")}</span><strong>{user?.created_at?.slice(0,10) || "—"}</strong></div>
              </div>

              {/* Referral */}
              <div className="referral-box">
                <span>🔗 {t("كود الإحالة", "Referral Code")}</span>
                <div className="referral-copy">
                  <input type="text" readOnly value={user?.referral_code || "—"} />
                  <button onClick={copyCode}>{t("نسخ", "Copy")}</button>
                </div>
              </div>

              {/* Upgrade Request */}
              {user?.role !== "student" && (
                <div style={{marginTop:20,paddingTop:20,borderTop:"1px solid #eee"}}>
                  <button onClick={gotoUpgrade} style={{padding:"12px 24px",background:"#d4af37",color:"#111",border:"none",borderRadius:14,fontWeight:700,cursor:"pointer"}}>⬆️ {t("طلب ترقية إلى Student", "Request Upgrade to Student")}</button>
                  <p style={{marginTop:8,fontSize:12,color:"#999"}}>{t("سيتم مراجعة طلبك من الادمن وتفعيل الحساب بعد التأكد من الدفع", "Your request will be reviewed by admin and the account will be activated after payment confirmation")}</p>
                </div>
              )}

              {/* Enrolled Courses */}
              <div style={{marginTop:24,paddingTop:20,borderTop:"1px solid #eee"}}>
                <h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>📚 {t("الكورسات المشترك فيها", "Enrolled Courses")}</h3>
                {enrollments.length === 0 ? (
                  <p style={{color:"#888",fontSize:13}}>{t("لا يوجد كورسات مشترك فيها", "No enrolled courses")}</p>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {enrollments.map((e) => (
                      <Link key={e.id} to={`/courses/${e.course_id}`} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fafafa",borderRadius:12,padding:"12px 16px",textDecoration:"none",color:"inherit"}}>
                        <div><p style={{fontWeight:600}}>{e.title_ar || e.title}</p><p style={{fontSize:12,color:"#888"}}>{e.difficulty}</p></div>
                        <span style={{fontSize:12,color:"#d4af37",fontWeight:600}}>{e.progress || 0}%</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "wallet" && (
          <div style={{maxWidth:800}}>
            <div className="rank-progress-card" style={{marginBottom:25}}>
              <h3 style={{marginBottom:20}}>💰 {t("المحفظة", "Wallet")}</h3>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:15}}>
                <div style={{background:"#faf7ef",borderRadius:20,padding:20}}>
                  <span style={{color:"#b8860b",fontSize:13}}>E-Money {t("الرصيد", "Balance")}</span>
                  <h2 style={{marginTop:5,color:"#111",fontSize:28}}>{user?.e_money || 0}</h2>
                </div>
                <div style={{background:"#faf7ef",borderRadius:20,padding:20}}>
                  <span style={{color:"#b8860b",fontSize:13}}>{t("النقاط الدراسية", "Academic Points")}</span>
                  <h2 style={{marginTop:5,color:"#111",fontSize:28}}>{user?.academic_points || 0}</h2>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="rank-progress-card" style={{marginBottom:25}}>
              <h3 style={{marginBottom:20}}>📋 {t("المعاملات المالية", "Transactions")}</h3>
              {transactions.filter(t => t.user_id === user.id).length === 0 ? (
                <p style={{color:"#888"}}>{t("لا توجد معاملات بعد", "No transactions yet")}</p>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {transactions.filter(t => t.user_id === user.id).map((t, i) => (
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fafafa",borderRadius:12,padding:"12px 16px"}}>
                      <div>
                        <p style={{fontWeight:600}}>{t.description || "—"}</p>
                        <p style={{fontSize:11,color:"#888"}}>{t.created_at?.slice(0,16)?.replace("T"," ")} · {t.status}</p>
                      </div>
                      <span style={{fontWeight:700,color: t.type === "credit" ? "green" : "#d32f2f"}}>
                        {t.type === "credit" ? "+" : "-"}{t.amount} EM
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rank-progress-card">
              <h3 style={{marginBottom:20}}>🏆 {t("العمولات", "Commissions")}</h3>
              {commissions.length === 0 ? (
                <p style={{color:"#888"}}>{t("لا توجد عمولات بعد", "No commissions yet")}</p>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {commissions.map((c, i) => (
                    <div key={i} style={{display:"flex",justifyContent:"space-between",background:"#fafafa",borderRadius:12,padding:"12px 16px"}}>
                      <div><p style={{fontWeight:600}}>{t("عمولة المستوى", "Level")} {c.level}</p><p style={{fontSize:12,color:"#888"}}>{t("من:", "From:")} {(c.from_user_id || "").slice(0,8)}...</p></div>
                      <span style={{fontWeight:700,color:"#d4af37"}}>+{c.amount} EM</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="dash-footer">
        <p>© 2026 Everest Academy. All Rights Reserved.</p>
        <div className="footer-links">
          <a href="#">{t("الدعم", "Support")}</a>
          <a href="#">{t("الخصوصية", "Privacy")}</a>
          <a href="#">{t("الشروط", "Terms")}</a>
        </div>
      </footer>
    </div>
  );
}
