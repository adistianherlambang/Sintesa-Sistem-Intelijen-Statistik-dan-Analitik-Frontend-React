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
    <div className={styles.card} style={{ backgroundImage: "url('/img/aiSummaryBackground.png')" }}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.aiIconWrapper}>
            <svg className={styles.svg} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.5 0C9.987 1.854 9.32625 2.48738 7.5 3C9.32625 3.51262 9.987 4.146 10.5 6C11.013 4.146 11.6737 3.51262 13.5 3C11.6737 2.48738 11.013 1.854 10.5 0ZM5.25 3C4.35187 6.24412 3.1965 7.353 0 8.25C3.1965 9.147 4.35187 10.2559 5.25 13.5C6.14813 10.2559 7.3035 9.147 10.5 8.25C7.3035 7.353 6.14813 6.24412 5.25 3Z" fill="#34B34A" />
            </svg>
          </div>
          <div className={styles.titleWrapper}>
            <p className={styles.title}>Ringkasan AI</p>
          </div>
        </div>
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