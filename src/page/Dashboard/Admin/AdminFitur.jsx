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
      const res = await axios.get("/api/admin/features", getHeaders());
      if (res.data?.data) {
        setFeatures(res.data.data);
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
        `/api/admin/features/${featureId}/toggle`,
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
          Matikan atau hidupkan fitur sistem secara terpusat untuk seluruh pengguna platform.
        </p>
      </div>

      {error && (
        <Wrapper style={{ borderColor: "#ef4444", background: "rgba(239, 68, 68, 0.08)" }}>
          <p style={{ color: "#ef4444", margin: 0 }}>{error}</p>
        </Wrapper>
      )}

      {successMsg && (
        <Wrapper style={{ borderColor: "#34B34A", background: "rgba(52, 179, 74, 0.08)" }}>
          <p style={{ color: "#34B34A", margin: 0, fontWeight: 500 }}>{successMsg}</p>
        </Wrapper>
      )}

      {/* CAUTION BOX */}
      <div className={styles.alertBox}>
        <div>
          <h4 className={styles.alertTitle}>Peringatan Kontrol Global</h4>
          <p className={styles.alertDesc}>
            Menonaktifkan fitur di halaman ini akan segera menutup akses fitur tersebut bagi semua pengguna umum di platform. Pastikan perubahan telah sesuai dengan jadwal pemeliharaan atau kebijakan layanan.
          </p>
        </div>
      </div>

      <Wrapper>
        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#D5D5D5", margin: "0 0 16px 0" }}>
          Daftar Fitur Platform
        </h2>

        {loading ? (
          <p style={{ color: "#888" }}>Memuat status fitur...</p>
        ) : (
          <div className={styles.featuresList}>
            {features.map((item) => {
              const isTogglingThis = toggling[item.featureId];
              return (
                <div key={item.featureId} className={styles.featureCard}>
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
                </div>
              );
            })}
          </div>
        )}
      </Wrapper>
    </div>
  );
}
