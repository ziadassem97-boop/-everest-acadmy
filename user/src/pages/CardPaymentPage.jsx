import { Link } from "react-router-dom";

export default function CardPaymentPage() {
  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: "linear-gradient(135deg, #f5bcdb, #602e81)",
      display: "flex", justifyContent: "center", alignItems: "center",
      minHeight: "100vh", margin: 0, padding: 20
    }}>
      <div className="container" style={{
        background: "white", width: "90%", maxWidth: 750,
        padding: 40, borderRadius: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.05)"
      }}>
        <Link to="/payment" style={{ display: "block", marginBottom: 20, textDecoration: "none", color: "#64748b", fontSize: 14 }}>
          ← العودة لوسائل الدفع
        </Link>
        <div style={{ textAlign: "center" }}>
          <div className="header" style={{ fontWeight: 600, color: "#a855f7", marginBottom: 30, borderBottom: "2px solid #a855f7", display: "inline-block" }}>
            Payment method
          </div>
        </div>

        <div style={{ display: "flex", gap: 50, flexWrap: "wrap" }}>
          <div className="card-visual" style={{
            width: 320, height: 190,
            background: "linear-gradient(135deg, #a934fd 0%, #fecfef 99%, #fd91db 100%)",
            borderRadius: 16, padding: 20, color: "white",
            boxShadow: "0 15px 25px -5px rgba(255,107,129,0.4)",
            display: "flex", flexDirection: "column", justifyContent: "space-between"
          }}>
            <div style={{ fontSize: 20, letterSpacing: 2 }}>1234 5678 9012 3456</div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>EXPIRES</div>
              <div>12/24</div>
            </div>
            <div>Lorem Ipsum</div>
          </div>

          <div className="form-section" style={{ flex: 1, minWidth: 300 }}>
            <div className="input-group" style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 5 }}>Cardholder Name</label>
              <input type="text" placeholder="John Doe" style={{ width: "100%", padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div className="input-group" style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 5 }}>Card Number</label>
              <input type="text" placeholder="0000 0000 0000 0000" style={{ width: "100%", padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 15 }}>
              <div className="input-group" style={{ marginBottom: 20, flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 5 }}>Month</label>
                <input type="text" placeholder="08" style={{ width: "100%", padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div className="input-group" style={{ marginBottom: 20, flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 5 }}>Year</label>
                <input type="text" placeholder="2024" style={{ width: "100%", padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div className="input-group" style={{ marginBottom: 20, flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 5 }}>CVV</label>
                <input type="text" placeholder="123" style={{ width: "100%", padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ margin: "10px 0", fontWeight: 600 }}>Amount: 1234$</div>
            <button className="pay-btn" style={{
              background: "#a855f7", color: "white", border: "none",
              width: "100%", padding: 14, borderRadius: 8,
              cursor: "pointer", fontWeight: 600, marginTop: 10
            }}>Confirm Payment</button>
          </div>
        </div>
      </div>
    </div>
  );
}
