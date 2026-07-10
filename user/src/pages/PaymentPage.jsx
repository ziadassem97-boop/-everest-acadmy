import { Link } from "react-router-dom";
import { useLang } from "../LangContext";

export default function PaymentPage() {
  const { t } = useLang();
  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: "linear-gradient(135deg, #f5bcdb, #602e81)",
      display: "flex", justifyContent: "center", alignItems: "center",
      minHeight: "100vh", margin: 0, padding: 20
    }}>
      <div style={{
        background: "#fff", width: "100%", maxWidth: 450,
        padding: 32, borderRadius: 24, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
      }}>
        <Link to="/courses" style={{ display: "block", marginBottom: 20, textDecoration: "none", color: "#64748b", fontSize: 14 }}>
          {t("رجوع←","Back←")}
        </Link>
        <h2 style={{ fontSize: 20, marginBottom: 24, color: "#68066d", textAlign: "center" }}>
          {t("اختر وسيلة الدفع","Choose Payment Method")}
        </h2>

        <Link to="/payment/card" className="method-btn" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", padding: "18px 20px", marginBottom: 12,
          border: "1.5px solid #e2e8f0", borderRadius: 14, background: "white",
          cursor: "pointer", transition: "all 0.2s", textDecoration: "none",
          color: "#475569", boxSizing: "border-box"
        }}>
          <span style={{ fontWeight: 500, fontSize: 15 }}>{t("البطاقات البنكية","Bank Cards")}</span>
          <span style={{ fontSize: 20 }}>💳</span>
        </Link>

        <Link to="/payment/instapay" className="method-btn" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", padding: "18px 20px", marginBottom: 12,
          border: "1.5px solid #e2e8f0", borderRadius: 14, background: "white",
          cursor: "pointer", transition: "all 0.2s", textDecoration: "none",
          color: "#475569", boxSizing: "border-box"
        }}>
          <span style={{ fontWeight: 500, fontSize: 15 }}>{t("إنستا باي","InstaPay")}</span>
          <span style={{ fontSize: 20 }}>📱</span>
        </Link>

        <Link to="/payment/vodafone" className="method-btn" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", padding: "18px 20px", marginBottom: 12,
          border: "1.5px solid #e2e8f0", borderRadius: 14, background: "white",
          cursor: "pointer", transition: "all 0.2s", textDecoration: "none",
          color: "#475569", boxSizing: "border-box"
        }}>
          <span style={{ fontWeight: 500, fontSize: 15 }}>{t("فودافون كاش","Vodafone Cash")}</span>
          <span style={{ fontSize: 20 }}>🔴</span>
        </Link>
      </div>
    </div>
  );
}
