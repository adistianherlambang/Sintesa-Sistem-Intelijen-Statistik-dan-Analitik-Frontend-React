import React from "react";
import { useNavigate } from "react-router-dom";
import Wrapper from "../Wrapper/Wrapper";
import Button from "../Button/Button";

export default function FeatureDisabled({
  featureName = "Fitur ini",
  onBack,
  backText = "Kembali ke Overview"
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto 0 auto" }}>
      <Wrapper>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px", padding: "20px 10px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ef4444"
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>

          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#fff", margin: "0 0 8px 0" }}>
              {featureName} Dinonaktifkan Sementara
            </h2>
            <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.65)", lineHeight: "1.5", margin: 0 }}>
              Fitur ini sedang dinonaktifkan oleh Administrator sistem. Silakan periksa kembali nanti atau hubungi administrator untuk informasi lebih lanjut.
            </p>
          </div>

          <div style={{ marginTop: "12px", width: "220px" }}>
            <Button onClick={handleBack} fullWidth>
              {backText}
            </Button>
          </div>
        </div>
      </Wrapper>
    </div>
  );
}
