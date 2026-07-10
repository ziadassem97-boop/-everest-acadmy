import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useLang } from "../LangContext";
import { api } from "../App";

export default function LoginPage() {
  const { t } = useLang();
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [showPass, setShowPass] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr("");
    try {
      const { user, session_token } = await api("/api/auth/login", { method: "POST", body: JSON.stringify(form) });
      login(user, session_token); nav("/home");
    } catch (e) { setErr(t(e.message || "بيانات الدخول غير صحيحة", e.message || "Invalid login credentials")); }
  };

  return (
    <div className="auth-body">
      <div className="auth-card">
        <div className="auth-back">
          <Link to="/">
            <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span>{t("العودة", "Back")}</span>
          </Link>
        </div>
        <div className="auth-brand">
<h1>{t("Everest Academy", "Everest Academy")}</h1>
           <p>{t("مرحباً بك مجدداً", "Welcome Back")}</p>
        </div>
        {err && <p style={{color:"#ff4d4d",textAlign:"center",marginBottom:15,fontSize:14}}>{err}</p>}
        <form onSubmit={submit}>
          <div className="auth-field">
            <label>{t("البريد الإلكتروني / الهاتف", "Email / Phone")}</label>
             <input type="text" required placeholder={t("أدخل بياناتك", "Enter your data")} value={form.email} onChange={(e) => setForm({...form,email:e.target.value})} />
          </div>
          <div className="auth-field">
<label>{t("كلمة المرور", "Password")}</label>
             <input type={showPass ? "text" : "password"} required placeholder="••••••••" value={form.password} onChange={(e) => setForm({...form,password:e.target.value})} />
          </div>
          <div className="auth-options">
            <label className="auth-show-pass">
              <input type="checkbox" checked={showPass} onChange={() => setShowPass(!showPass)} />
              <span>{t("إظهار الباسورد", "Show Password")}</span>
            </label>
            <a href="#" className="auth-forgot">{t("نسيت كلمة المرور؟", "Forgot Password?")}</a>
          </div>
          <div style={{textAlign:"center"}}>
            <button type="submit" className="auth-btn">{t("تسجيل الدخول", "Login")}</button>
            <div className="auth-switch">
              {t("ليس لديك حساب؟", "Don't have an account?")} <Link to="/register">{t("سجل الآن مجاناً", "Register Now")}</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
