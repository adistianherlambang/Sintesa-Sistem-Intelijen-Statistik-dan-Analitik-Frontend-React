import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./BotOverview.module.css";
import Skeleton from "../../Skeleton/Skeleton";

const BotStatusOverview = () => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_URL_SERVER}/api/users/bot/session`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const botStatus = response.data?.status || "disconnected";
        if (botStatus === "connected") {
          setStatus("Tersambung");
        } else if (botStatus === "connecting") {
          setStatus("Menghubungkan");
        } else {
          setStatus("Terputus");
        }
      } catch (err) {
        console.error("Gagal memuat status bot:", err.message);
        setStatus("Terputus");
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) {
    return <Skeleton height="50px" />;
  }

  const statusColor = status === "Tersambung" ? "white" : status === "Menghubungkan" ? "#F59E0B" : "#D52B2B";

  return (
    <>
      <div className={styles.container}>
        <div className={styles.iconWrapper}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.6683 2.32804C12.9311 1.58732 12.0531 1.00001 11.0854 0.600331C10.1178 0.200649 9.07987 -0.00341053 8.03216 4.3116e-05C3.64221 4.3116e-05 0.0643217 3.56003 0.0643217 7.92802C0.0643217 9.32802 0.434171 10.688 1.12563 11.888L0 16L4.22111 14.896C5.38693 15.528 6.69749 15.864 8.03216 15.864C12.4221 15.864 16 12.304 16 7.93602C16 5.81603 15.1719 3.82403 13.6683 2.32804ZM8.03216 14.52C6.84221 14.52 5.67638 14.2 4.65528 13.6L4.41407 13.456L1.90553 14.112L2.57286 11.68L2.41206 11.432C1.75079 10.3817 1.39974 9.16744 1.39899 7.92802C1.39899 4.29603 4.37387 1.33604 8.02412 1.33604C9.79296 1.33604 11.4573 2.02404 12.7035 3.27203C13.3207 3.88312 13.8098 4.61006 14.1424 5.41069C14.475 6.21132 14.6446 7.06969 14.6412 7.93602C14.6573 11.568 11.6824 14.52 8.03216 14.52ZM11.6663 9.59202C11.4653 9.49602 10.4844 9.01602 10.3075 8.94402C10.1226 8.88002 9.99397 8.84802 9.85729 9.04002C9.7206 9.24002 9.34271 9.68802 9.23015 9.81602C9.11759 9.95202 8.99698 9.96802 8.79598 9.86402C8.59497 9.76802 7.95176 9.55202 7.19598 8.88002C6.601 8.35202 6.20703 7.70402 6.08643 7.50402C5.97387 7.30402 6.07035 7.20002 6.17487 7.09602C6.26332 7.00802 6.37588 6.86402 6.47236 6.75203C6.56884 6.64003 6.60905 6.55203 6.67337 6.42403C6.73769 6.28803 6.70553 6.17603 6.65729 6.08003C6.60904 5.98403 6.20703 5.00803 6.04623 4.60803C5.88543 4.22403 5.71658 4.27203 5.59598 4.26403H5.21005C5.07337 4.26403 4.86432 4.31203 4.6794 4.51203C4.50251 4.71203 3.98794 5.19203 3.98794 6.16803C3.98794 7.14402 4.70352 8.08802 4.8 8.21602C4.89648 8.35202 6.20703 10.352 8.201 11.208C8.67538 11.416 9.04523 11.536 9.33467 11.624C9.80904 11.776 10.2432 11.752 10.5889 11.704C10.9749 11.648 11.7709 11.224 11.9317 10.76C12.1005 10.296 12.1005 9.90402 12.0442 9.81602C11.9879 9.72802 11.8673 9.68802 11.6663 9.59202Z" fill="white" />
          </svg>
        </div>
        <div className={styles.contentWrapper}>
          <p className={styles.title}>Bot Status</p>
          <p className={styles.content} style={{ color: statusColor }}>{status}</p>
        </div>
      </div>
    </>
  );
};

const BotKnowledgeOverview = () => {
  const [jumlahKnowledge, setJumlahKnowledge] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_URL_SERVER}/api/users/bot/knowledge`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setJumlahKnowledge(response.data?.length || 0);
      } catch (err) {
        console.error("Gagal memuat knowledge bot:", err.message);
        setJumlahKnowledge(0);
      } finally {
        setLoading(false);
      }
    };
    fetchKnowledge();
  }, []);

  if (loading) {
    return <Skeleton height="50px" />;
  }

  const knowledgeRating = jumlahKnowledge < 5 ? "Kurang" : "Bagus";
  const ratingColor = knowledgeRating === "Bagus" ? "#34B34A" : "#D52B2B";

  return (
    <>
      <div className={styles.container}>
        <div className={styles.iconWrapper}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.61157 5.87976L8.91158 3.58437C8.64928 2.72517 7.35042 2.72517 7.08812 3.58437L6.38892 5.87976C6.34465 6.02497 6.26165 6.1572 6.14774 6.26398C6.03384 6.37077 5.89279 6.44859 5.73791 6.49009L3.28951 7.1456C2.37304 7.39151 2.37304 8.6092 3.28951 8.85511L5.73791 9.51061C5.89279 9.55212 6.03384 9.62993 6.14774 9.73672C6.26165 9.8435 6.34465 9.97574 6.38892 10.1209L7.08812 12.4163C7.35042 13.2755 8.64928 13.2755 8.91158 12.4163L9.61078 10.1209C9.65505 9.97574 9.73806 9.8435 9.85196 9.73672C9.96586 9.62993 10.1069 9.55212 10.2618 9.51061L12.7102 8.85511C13.6267 8.6092 13.6267 7.39151 12.7102 7.1456L10.2618 6.49009C10.1069 6.44859 9.96586 6.37077 9.85196 6.26398C9.73806 6.1572 9.65505 6.02497 9.61078 5.87976M3.17733 11.3386C2.949 10.7135 1.98907 10.7135 1.76154 11.3386L1.74179 11.4031L1.50714 12.283L0.568547 12.5023C-0.189121 12.68 -0.189911 13.6896 0.568547 13.8673L1.50714 14.0873L1.74179 14.9673C1.9314 15.6776 3.00746 15.6776 3.19708 14.9673L3.43172 14.0873L4.37032 13.8673C5.12877 13.6896 5.12877 12.68 4.37032 12.5023L3.43172 12.283L3.19708 11.4031L3.17733 11.3386ZM2.46943 13.0348C2.5152 13.0917 2.56948 13.1421 2.6306 13.1844C2.56937 13.2272 2.51508 13.2781 2.46943 13.3355C2.42402 13.2782 2.37 13.2273 2.30905 13.1844C2.36995 13.1418 2.42396 13.0912 2.46943 13.0341M14.2382 0.968263C14.0027 0.323124 12.9859 0.344604 12.8026 1.0327L12.568 1.91264L11.6294 2.13262C10.8717 2.31039 10.8709 3.31921 11.6294 3.49697L12.568 3.71696L12.8026 4.59689C12.9922 5.30721 14.0683 5.30721 14.2579 4.59689L14.4926 3.71696L15.4312 3.49697C16.1896 3.31921 16.1896 2.30965 15.4312 2.13262L14.4926 1.91264L14.2579 1.0327L14.2382 0.968263ZM13.5303 2.66518C13.576 2.72206 13.6303 2.77245 13.6914 2.8148C13.6302 2.8576 13.5759 2.90849 13.5303 2.9659C13.4849 2.90855 13.4308 2.85765 13.3699 2.8148C13.4308 2.77217 13.4848 2.72227 13.5303 2.66518Z" fill="white" />
          </svg>
        </div>
        <div className={styles.contentWrapper}>
          <p className={styles.title}>Knowledge ({jumlahKnowledge})</p>
          <p className={styles.content} style={{ color: ratingColor }}>{knowledgeRating}</p>
        </div>
      </div>
    </>
  );
};

export { BotStatusOverview, BotKnowledgeOverview };