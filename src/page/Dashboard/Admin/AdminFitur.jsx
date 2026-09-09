import { useState, useEffect } from "react";
import axios from "axios";
import Wrapper from "../../../components/Wrapper/Wrapper";
import styles from "./AdminFitur.module.css";

export default function AdminFitur() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState({});
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${serverUrl}/api/admin/features`, getHeaders());
      const data = res.data?.data || res.data?.features;
      if (Array.isArray(data)) {
        setFeatures(data);
      }
    } catch (err) {
      console.error("Gagal mengambil data fitur:", err);
      setError(err.response?.data?.message || "Gagal mengambil daftar fitur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleToggle = async (featureId, currentEnabled) => {
    const nextState = !currentEnabled;
    try {
      setToggling((prev) => ({ ...prev, [featureId]: true }));
      setSuccessMsg("");
      setError("");

      const res = await axios.put(
        `${serverUrl}/api/admin/features/${featureId}/toggle`,
        { enabled: nextState },
        getHeaders()
      );

      if (res.data?.success) {
        setFeatures((prev) =>
          prev.map((f) => (f.featureId === featureId ? { ...f, enabled: nextState } : f))
        );
        setSuccessMsg(
          `Fitur "${featureId}" berhasil di-${nextState ? "aktifkan" : "nonaktifkan"}.`
        );
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Gagal mengubah status fitur:", err);
      setError(err.response?.data?.message || "Gagal mengubah status fitur.");
    } finally {
      setToggling((prev) => ({ ...prev, [featureId]: false }));
    }
  };

  return (
    <div className={styles.container}>
      <div>
        <h1 className={styles.tabTitle}>Kontrol &amp; Sakelar Fitur</h1>
        <p className={styles.subText}>
          Matikan atau hidupkan akses halaman serta tombol tab (Workspace Analisis, Bot WhatsApp, Infografis) pada akun pengguna (role user).
        </p>
      </div>

      {error && (
        <Wrapper style={{ background: "rgba(239, 68, 68, 0.08)" }}>
          <p style={{ color: "#ef4444", margin: 0 }}>{error}</p>
        </Wrapper>
      )}

      {successMsg && (
        <Wrapper style={{ background: "rgba(52, 179, 74, 0.08)" }}>
          <p style={{ color: "#34B34A", margin: 0, fontWeight: 500 }}>{successMsg}</p>
        </Wrapper>
      )}

      {/* CAUTION BOX */}
      <Wrapper className={styles.alertBox} padding="16px">
        <div>
          <h4 className={styles.alertTitle}>Peringatan Kontrol Global</h4>
          <p className={styles.alertDesc}>
            Menonaktifkan sakelar di bawah ini akan secara instan men-disable tombol tab di sidebar dan mengunci halaman terkait bagi seluruh pengguna umum (role user).
          </p>
        </div>
      </Wrapper>

      <Wrapper>
        <p className={styles.sectionTitle}>Daftar Fitur Platform</p>

        {loading ? (
          <p style={{ color: "#888" }}>Memuat status fitur...</p>
        ) : (
          <div className={styles.featuresList}>
            {features.map((item) => {
              const isTogglingThis = toggling[item.featureId];
              return (
                <Wrapper key={item.featureId} className={styles.featureCard} padding="20px 24px">
                  <div className={styles.featureInfo}>
                    <div className={styles.featureHeader}>
                      <h3 className={styles.featureName}>{item.name}</h3>
                      <span className={styles.featureKey}>{item.featureId}</span>
                    </div>
                    <p className={styles.featureDesc}>{item.description}</p>
                  </div>

                  <div className={styles.toggleWrapper}>
                    <span
                      className={`${styles.statusText} ${
                        item.enabled ? styles.statusOn : styles.statusOff
                      }`}
                    >
                      {item.enabled ? "Aktif" : "Nonaktif"}
                    </span>

                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        disabled={isTogglingThis}
                        onChange={() => handleToggle(item.featureId, item.enabled)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        )}
      </Wrapper>
    </div>
  );
}
