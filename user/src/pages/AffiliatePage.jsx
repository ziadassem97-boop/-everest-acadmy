import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useLang } from "../LangContext";
import { api } from "../App";
import AppNavbar from "../components/AppNavbar";

function TeamMemberNode({ member, depth }) {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(true);
  const hasChildren = member.children && member.children.length > 0;
  return (
    <div style={{marginLeft: depth * 24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fafafa",borderRadius:14,padding:"12px 16px",marginBottom:6,borderLeft: depth > 0 ? "3px solid #d4af37" : "none"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {hasChildren && (
            <button onClick={() => setExpanded(!expanded)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#888"}}>
              {expanded ? "▼" : "▶"}
            </button>
          )}
          <div style={{width:36,height:36,borderRadius:"50%",background:"#f0e8d8",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"#b8860b"}}>{(member.full_name || "?")[0]}</div>
          <div><p style={{fontWeight:600}}>{member.full_name}</p><p style={{fontSize:12,color:"#888"}}>{t("المستوى:", "Level:")} {depth + 1} · {member.rank || "Star"}</p></div>
        </div>
        <span style={{fontSize:12,color:"#888"}}>{member.created_at?.slice(0,10) || "—"}</span>
      </div>
      {expanded && hasChildren && member.children.map((child) => (
        <TeamMemberNode key={child.id} member={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function AffiliatePage() {
  const { t, dir } = useLang();
  const { user, logout, login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [tree, setTree] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [tab, setTab] = useState(() => new URLSearchParams(loc.search).get("tab") || "overview");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferMsg, setTransferMsg] = useState("");
  const [directs, setDirects] = useState([]);
  const [upline, setUpline] = useState(null);
  useEffect(() => {
    if (!user) return;
    api(`/api/mlm/tree?userId=${user.id}`).then(setTree).catch(() => {});
    api(`/api/mlm/commissions?userId=${user.id}`).then(setCommissions).catch(() => {});
    api(`/api/mlm/directs/${user.id}`).then(setDirects).catch(() => {});
    api(`/api/mlm/upline/${user.id}`).then((u) => setUpline(u[0] || null)).catch(() => {});
  }, [user]);

  const copyCode = () => {
    if (user?.referral_code) { navigator.clipboard.writeText(user.referral_code); alert(t("تم نسخ كود الإحالة ✅", "Referral code copied ✅")); }
  };

  const totalCommissions = commissions.reduce((s, c) => s + c.amount, 0);
  const uniqueLevels = [...new Set(commissions.map(c => c.level))].sort((a, b) => a - b);
  const levels = uniqueLevels.length > 0
    ? uniqueLevels.map(l => ({ level: l, name: l === 1 ? t(`المستوى ${l} (مباشر)`, `Level ${l} (Direct)`) : t(`المستوى ${l}`, `Level ${l}`), amount: 1000 }))
    : [{ level: 1, name: t("المستوى 1 (مباشر)", "Level 1 (Direct)"), amount: 1000 }];

  return (
    <div style={{direction: dir }}>
      <AppNavbar />

      <div className="dash-container" style={{marginTop:30}}>
        <div className="section-header"><h2>{t("نظام الإحالة", "Affiliate System")}</h2></div>
        <div style={{display:"flex",gap:10,marginBottom:25}}>
          {["overview","team","commissions","transfer"].map((tb) => (
            <button key={tb} onClick={() => { setTab(tb); nav(tb === "overview" ? "/affiliate" : `/affiliate?tab=${tb}`, {replace:true}); }}
              style={{padding:"10px 22px",borderRadius:14,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,background:tab===tb?"#111":"#f0f0f0",color:tab===tb?"#d4af37":"#555"}}
            >{{overview:t("نظرة عامة", "Overview"),team:t("فريقي", "My Team"),commissions:t("العمولات", "Commissions"),transfer:t("تحويل", "Transfer")}[tb]}</button>
          ))}
        </div>

        {tab === "overview" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:25}}>
            <div className="rank-progress-card">
              <h3 style={{marginBottom:20}}>🔗 {t("كود الإحالة الخاص بك", "Your Referral Code")}</h3>
              <div style={{background:"#faf7ef",border:"1px solid rgba(212,175,55,.2)",borderRadius:16,padding:20,textAlign:"center",marginBottom:16}}>
                <p style={{fontSize:24,fontWeight:800,color:"#b8860b",letterSpacing:2,fontFamily:"monospace"}}>{user?.referral_code}</p>
              </div>
              <button onClick={copyCode} className="renew-btn" style={{width:"100%"}}>{t("نسخ الكود", "Copy Code")}</button>
              <p style={{fontSize:12,color:"#888",textAlign:"center",marginTop:12}}>{t("شارك هذا الكود مع أصدقائك. عندما يسجل شخص ما باستخدام كودك، تحصل على عمولة فورية!", "Share this code with friends. When someone registers using your code, you get instant commission!")}</p>
            </div>
            <div className="rank-progress-card">
              <h3 style={{marginBottom:20}}>💰 {t("خطة العمولات", "Commission Plan")}</h3>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {[{ level: 1, name: t("المستوى 1 (مباشر)", "Level 1 (Direct)"), amount: 1000 },{ level: 2, name: t("المستوى 2", "Level 2"), amount: 1000 },{ level: 3, name: t("المستوى 3", "Level 3"), amount: 1000 }].map((l) => (
                  <div key={l.level} style={{display:"flex",justifyContent:"space-between",background:"#fafafa",borderRadius:14,padding:"14px 18px"}}>
                    <div><p style={{fontWeight:600}}>{l.name}</p><p style={{fontSize:12,color:"#888"}}>{t("لكل عضو جديد يسجل تحتك", "For each new member who registers under you")}</p></div>
                    <span style={{fontWeight:700,color:"#d4af37"}}>+{l.amount} E-Money</span>
                  </div>
                ))}
              </div>
              <p style={{fontSize:12,color:"#888",textAlign:"center",marginTop:12,borderTop:"1px solid #eee",paddingTop:12}}>{t("جميع المستويات تكسب", "All levels earn")} <strong>1,000 E-Money</strong> {t("لكل عضو جديد · مستويات غير محدودة!", "per new member · Unlimited levels!")}</p>
              <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #eee",display:"flex",justifyContent:"space-between"}}>
                <p style={{fontWeight:600}}>{t("إجمالي العمولات", "Total Commissions")}</p>
                <span style={{fontSize:22,fontWeight:800,color:"#b8860b"}}>{totalCommissions} E-Money</span>
              </div>
            </div>
            <div style={{gridColumn:"span 2"}}>
              <div className="rank-progress-card">
                <h3 style={{marginBottom:20}}>{t("إحصائيات الإحالة", "Referral Stats")}</h3>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
                  {[
                    { label:t("المباشرون", "Directs"), value: user?.direct_count || 0, color:"#2563ff" },
                    { label:t("إجمالي العمولة", "Total Commission"), value: `${totalCommissions}`, color:"#d4af37" },
                    { label:t("عدد العمولات", "Commission Count"), value: commissions.length, color:"#a855f7" },
                    { label:t("رصيد E-Money", "E-Money Balance"), value: `${user?.e_money || 0}`, color:"#22c55e" },
                  ].map((s, i) => (
                    <div key={i} style={{background:"#faf7ef",borderRadius:16,padding:20,textAlign:"center"}}>
                      <p style={{fontSize:28,fontWeight:800,color:s.color}}>{s.value}</p>
                      <p style={{fontSize:13,color:"#888",marginTop:4}}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "team" && (
          <div className="rank-progress-card">
            <h3 style={{marginBottom:20}}>👥 {t("فريقي (شجرة الإحالة)", "My Team (Referral Tree)")}</h3>
            {tree.length === 0 ? (
              <p style={{color:"#888",textAlign:"center",padding:30}}>{t("لا يوجد أعضاء في الفريق بعد. شارك كود الإحالة لبناء فريقك!", "No team members yet. Share your referral code to build your team!")}</p>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {tree.map((m) => (
                  <TeamMemberNode key={m.id} member={m} depth={0} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "commissions" && (
          <div className="rank-progress-card">
            <h3 style={{marginBottom:20}}>📋 {t("سجل العمولات", "Commission History")}</h3>
            {commissions.length === 0 ? (
              <p style={{color:"#888",textAlign:"center",padding:30}}>{t("لا توجد عمولات بعد", "No commissions yet")}</p>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {commissions.map((c, i) => (
                  <div key={i} style={{display:"flex",justifyContent:"space-between",background:"#fafafa",borderRadius:14,padding:"12px 16px"}}>
                    <div><p style={{fontWeight:600}}>{t("عمولة المستوى", "Level")} {c.level}</p><p style={{fontSize:12,color:"#888"}}>{c.created_at?.slice(0,16) || "—"}</p></div>
                    <span style={{fontWeight:700,color:"#d4af37"}}>+{c.amount} E-Money</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "transfer" && (
          <div className="rank-progress-card">
            <h3 style={{marginBottom:20}}>🔄 {t("تحويل E-Money", "E-Money Transfer")}</h3>
            <p style={{fontSize:13,color:"#888",marginBottom:16}}>{t("يمكنك التحويل فقط إلى الشخص الذي سجلك (Upline) أو الأشخاص الذين سجلتهم أنت (Downline المباشر).", "You can only transfer to your upline (who referred you) or your direct downlines (who you referred).")}</p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
              {/* Upline info */}
              <div style={{background:"#faf7ef",borderRadius:16,padding:20}}>
                <p style={{fontSize:12,color:"#888",marginBottom:8}}>{t("الـ Upline الخاص بك", "Your Upline")}</p>
                {upline ? (
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:40,height:40,borderRadius:"50%",background:"#d4af37",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700}}>{(upline.full_name || "?")[0]}</div>
                    <div><p style={{fontWeight:600}}>{upline.full_name}</p><p style={{fontSize:11,color:"#888"}}>{upline.rank || "Star"}</p></div>
                  </div>
                ) : <p style={{color:"#999",fontSize:13}}>{t("ليس لديك Upline", "No upline")}</p>}
              </div>
              {/* Balance */}
              <div style={{background:"#f0f7ff",borderRadius:16,padding:20}}>
                <p style={{fontSize:12,color:"#888",marginBottom:8}}>{t("رصيدك الحالي", "Your Balance")}</p>
                <p style={{fontSize:28,fontWeight:800,color:"#2563ff"}}>{user?.e_money || 0} <span style={{fontSize:14}}>E-Money</span></p>
              </div>
            </div>

            {/* Direct downlines */}
            {directs.length > 0 && (
              <div style={{marginBottom:16}}>
                <p style={{fontSize:13,fontWeight:600,marginBottom:8}}>{t("الـ Downline المباشرون (يمكنك التحويل لهم)", "Direct Downlines (you can transfer to them)")}</p>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {directs.map((d) => (
                    <div key={d.id} style={{display:"flex",alignItems:"center",gap:10,background:"#fafafa",borderRadius:12,padding:"10px 14px",cursor:"pointer",border: transferTo === d.id ? "2px solid #d4af37" : "none"}} onClick={() => setTransferTo(d.id)}>
                      <div style={{width:34,height:34,borderRadius:"50%",background:"#f0e8d8",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"#b8860b"}}>{(d.full_name || "?")[0]}</div>
                      <div style={{flex:1}}><p style={{fontWeight:600,fontSize:14}}>{d.full_name}</p><p style={{fontSize:11,color:"#888"}}>{d.rank || "Star"}</p></div>
                      {transferTo === d.id && <span style={{color:"#d4af37",fontSize:18}}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transfer form */}
            <div style={{background:"#fafafa",borderRadius:16,padding:20,marginTop:12}}>
              <p style={{fontWeight:600,marginBottom:12}}>{t("إجراء تحويل", "Make a Transfer")}</p>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                <select value={transferTo} onChange={(e) => setTransferTo(e.target.value)} style={{flex:1,minWidth:180,padding:"10px 14px",border:"1px solid #ddd",borderRadius:10,fontSize:13}}>
                  <option value="">{t("اختر المستلم...", "Select recipient...")}</option>
                  {upline && <option value={upline.id}>↑ {upline.full_name} ({t("Upline", "Upline")})</option>}
                  {directs.map((d) => <option key={d.id} value={d.id}>↓ {d.full_name} ({t("Downline", "Downline")})</option>)}
                </select>
                <input type="number" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} placeholder={t("المبلغ", "Amount")} min="1" style={{width:140,padding:"10px 14px",border:"1px solid #ddd",borderRadius:10,fontSize:13}} />
                <button onClick={async () => {
                  if (!transferTo || !transferAmount || parseFloat(transferAmount) <= 0) { setTransferMsg(t("اختر مستلم وأدخل مبلغ صحيح", "Select recipient and enter valid amount")); return; }
                  try {
                    setTransferMsg(t("جاري التحويل...", "Transferring..."));
                    const r = await api("/api/mlm/transfer", { method: "POST", body: JSON.stringify({ from_user_id: user.id, to_user_id: transferTo, amount: parseFloat(transferAmount) }) });
                    setTransferMsg(t(`✅ تم التحويل بنجاح! رصيدك الجديد: ${r.from_balance}`, `✅ Transfer successful! Your new balance: ${r.from_balance}`));
                    setTransferAmount("");
                    // Refresh data
                    const u = await api(`/api/users/${user.id}`);
                    login(u);
                  } catch (e) { setTransferMsg("❌ " + (e.message || t("فشل التحويل", "Transfer failed"))); }
                }} style={{padding:"10px 24px",background:"#d4af37",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer",color:"#111"}}>
                  {t("تحويل", "Transfer")}
                </button>
              </div>
              {transferMsg && <p style={{marginTop:10,fontSize:13,color: transferMsg.includes("✅") ? "green" : transferMsg.includes("❌") ? "red" : "#888"}}>{transferMsg}</p>}
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
