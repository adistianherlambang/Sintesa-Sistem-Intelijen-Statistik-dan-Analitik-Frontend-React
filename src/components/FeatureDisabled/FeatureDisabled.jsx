import React from "react";
import { useNavigate } from "react-router-dom";
import Wrapper from "../Wrapper/Wrapper";
import Button from "../Button/Button";

export default function FeatureDisabled({
  featureName = "Fitur ini",
  reason = "system_disabled",
  onBack,
  backText = "Kembali ke Overview"
}) {
  const navigate = useNavigate();
  const isSubscriptionRequired = reason === "subscription_required";

  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
    } else {
      navigate("/dashboard");
    }
  };

  const handleSubscribe = () => {
    navigate("/dashboard/akun/langgananDanBilling");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto 0 auto" }}>
      <Wrapper border={"none"}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px", padding: "28px 16px" }}>
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: isSubscriptionRequired ? "rgba(234, 179, 8, 0.15)" : "rgba(239, 68, 68, 0.15)",
            border: isSubscriptionRequired ? "1px solid rgba(234, 179, 8, 0.35)" : "1px solid rgba(239, 68, 68, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isSubscriptionRequired ? "#eab308" : "#ef4444"
          }}>
            {isSubscriptionRequired ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            )}
          </div>

          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#fff", margin: "0 0 8px 0" }}>
              {isSubscriptionRequired ? `Akses ${featureName} Terkunci` : `${featureName} Dinonaktifkan Sementara`}
            </h2>
            <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.65)", lineHeight: "1.6", margin: 0 }}>
              {isSubscriptionRequired
                ? `Fitur ${featureName} memerlukan paket langganan aktif. Akun Anda saat ini belum memiliki izin akses untuk fitur ini. Silakan berlangganan atau upgrade paket untuk membuka akses penuh.`
                : `Fitur ini sedang dinonaktifkan sementara oleh Administrator sistem. Silakan periksa kembali nanti atau hubungi administrator.`}
            </p>
          </div>

          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "260px" }}>
            {isSubscriptionRequired && (
              <Button onClick={handleSubscribe} fullWidth variant="primary">
                Lihat Paket Langganan
              </Button>
            )}
            <Button onClick={handleBack} fullWidth variant={isSubscriptionRequired ? "secondary" : "primary"}>
              {backText}
            </Button>
          </div>
        </div>
      </Wrapper>
    </div>
  );
}

