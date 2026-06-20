import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./AISummary.module.css";
import { userStore } from "../../../logic/state/store";
import AILoader from "../../AILoader/AILoader";

export default function AISummary({ onLoad }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = userStore((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userCity = user?.location?.name || "KOTA METRO";
        const res = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/aisummary`, {
          kota: userCity
        });
        setData(res.data);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.aiIconWrapper}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <p className={styles.title}>Ringkasan AI</p>
        </div>
        <span className={styles.subtitle}>Insights</span>
      </div>
      
      <div className={styles.body}>
        {loading ? (
          <AILoader text="Menganalisis indikator & menyusun ringkasan..." minHeight="80px" />
        ) : data && data.summary ? (
          <p className={styles.summaryText}>{data.summary}</p>
        ) : (
          <p className={styles.summaryText} style={{ color: 'rgba(255, 255, 255, 0.4)', fontStyle: 'italic', textAlign: 'center' }}>
            Tidak ada ringkasan yang tersedia untuk wilayah ini.
          </p>
        )}
      </div>
    </div>
  );
}