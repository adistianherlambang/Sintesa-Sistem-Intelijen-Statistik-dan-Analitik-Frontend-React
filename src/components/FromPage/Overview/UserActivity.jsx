import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./UserActivity.module.css";
import Skeleton from "../../Skeleton/Skeleton";

export default function UserActivity({ onLoad }) {
  const [activityList, setActivityList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_URL_SERVER}/api/users/activities`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setActivityList(response.data);
      } catch (err) {
        console.error("Gagal memuat aktivitas user:", err.message);
        setError("Gagal memuat aktivitas user.");
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const formatTanggal = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).replace(/\./g, ":");
  };

  return (
    <div className={styles.content}>
      <p className={styles.sectionTitle}>Aktivitas User</p>
      {loading ? (
        <div style={{ marginTop: '12px' }}>
          <Skeleton height="150px" />
        </div>
      ) : error ? (
        <p style={{ color: "#ef4444", fontSize: "14px" }}>{error}</p>
      ) : activityList.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>Belum ada aktivitas tercatat.</p>
      ) : (
        <div className={styles.tableResponsive}>
          <table className={styles.activityTable}>
            <tbody>
              {activityList.slice(0, 10).map((item, index) => (
                <tr key={item._id || index}>
                  <td className={styles.dateCol}>{formatTanggal(item.createdAt)}</td>
                  <td>{item.activityName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}