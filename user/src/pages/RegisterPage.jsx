import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useLang } from "../LangContext";
import { api } from "../App";

export default function RegisterPage() {
  const { t } = useLang();
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", confirm: "", address: "", referral_code: "", hasReferral: "no" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    if (form.password !== form.confirm) { setErr(t("كلمات المرور غير متطابقة!", "Passwords do not match!")); setLoading(false); return; }
    try {
      await api("/api/auth/register", { method: "POST", body: JSON.stringify({ full_name: form.full_name, email: form.email, phone: form.phone, password: form.password, referral_code: form.hasReferral === "yes" ? form.referral_code : "" }) });
      nav("/login");
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <div className="auth-body">
      <div className="auth-card wide">
        <div className="auth-back">
          <Link to="/">
            <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span>{t("العودة", "Back")}</span>
          </Link>
        </div>
        <div className="auth-brand">
<h1>{t("Everest Academy", "Everest Academy")}</h1>
           <p>{t("سجل الآن للانضمام إلى أقوى منصة تدريبية", "Register now to join the strongest training platform")}</p>
        </div>
        {err && <p style={{color:"#ff4d4d",textAlign:"center",marginBottom:15,fontSize:14,background:"#fffafa",padding:10,borderRadius:8}}>{err}</p>}
        <form onSubmit={submit}>
          <div className="auth-form-grid">
            <div className="auth-field">
              <label>{t("الاسم بالكامل", "Full Name")}</label>
              <input type="text" required placeholder={t("أدخل اسمك بالكامل", "Enter your full name")} value={form.full_name} onChange={(e) => setForm({...form,full_name:e.target.value})} />
            </div>
            <div className="auth-field">
              <label>{t("رقم الهاتف", "Phone Number")}</label>
              <input type="tel" required placeholder="01xxxxxxxxx" value={form.phone} onChange={(e) => setForm({...form,phone:e.target.value})} />
            </div>
            <div className="auth-field full">
              <label>{t("البريد الإلكتروني", "Email")}</label>
              <input type="email" required placeholder="mail@example.com" value={form.email} onChange={(e) => setForm({...form,email:e.target.value})} />
            </div>
            <div className="auth-field">
              <label>{t("كلمة المرور", "Password")}</label>
              <input type={showPass ? "text" : "password"} required placeholder="••••••••" value={form.password} onChange={(e) => setForm({...form,password:e.target.value})} />
            </div>
            <div className="auth-field">
              <label>{t("تأكيد كلمة المرور", "Confirm Password")}</label>
              <input type={showPass ? "text" : "password"} required placeholder="••••••••" value={form.confirm} onChange={(e) => setForm({...form,confirm:e.target.value})} />
            </div>
            <div className="auth-show-area">
              <input type="checkbox" id="sp" checked={showPass} onChange={() => setShowPass(!showPass)} />
              <label htmlFor="sp">{t("إظهار كلمة المرور", "Show Password")}</label>
            </div>
            <div className="auth-field full">
              <label>{t("العنوان", "Address")}</label>
              <input type="text" required placeholder={t("المحافظة، المدينة، تفاصيل العنوان", "Governorate, City, Address details")} value={form.address} onChange={(e) => setForm({...form,address:e.target.value})} />
            </div>
            <div className="full">
              <div className="auth-referral">
                <span className="auth-ref-title">{t("هل لديك كود إحالة؟", "Do you have a referral code?")}</span>
                <div className="auth-ref-options">
                  <label className="auth-ref-opt">
                    <input type="radio" name="ref" value="yes" checked={form.hasReferral === "yes"} onChange={() => setForm({...form,hasReferral:"yes"})} />
<span>{t("نعم", "Yes")}</span>
                   </label>
                   <label className="auth-ref-opt">
                     <input type="radio" name="ref" value="no" checked={form.hasReferral === "no"} onChange={() => setForm({...form,hasReferral:"no"})} />
                     <span>{t("لا", "No")}</span>
                  </label>
                </div>
                <div className={`auth-ref-input ${form.hasReferral === "yes" ? "open" : ""}`}>
                  <input type="text" placeholder={t("أدخل كود الإحالة", "Enter referral code")} value={form.referral_code} onChange={(e) => setForm({...form,referral_code:e.target.value})} />
                </div>
              </div>
            </div>
          </div>
          <div className="submit-container" style={{textAlign:"center",marginTop:30}}>
            <button type="submit" disabled={loading} className="auth-btn" style={{opacity:loading?0.5:1}}>
              {loading ? t("جاري إنشاء الحساب...", "Creating account...") : t("إنشاء حساب", "Create Account")}
            </button>
            <div className="auth-switch">
              {t("لديك حساب بالفعل؟", "Already have an account?")} <Link to="/login">{t("تسجيل الدخول", "Login")}</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
