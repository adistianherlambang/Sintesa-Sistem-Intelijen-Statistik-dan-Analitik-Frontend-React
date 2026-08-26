import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./HitoriAnalisis.module.css";
import Skeleton from "../../Skeleton/Skeleton";

export default function HitoriAnalisis({ onLoad }) {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_URL_SERVER}/api/users/analysis`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setHistoryList(response.data);
      } catch (err) {
        console.error("Gagal memuat histori analisis:", err.message);
        setError("Gagal memuat histori analisis.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDownloadIDML = async (id, title) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_URL_SERVER}/api/users/analysis/${id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.idml`;
      link.click();
    } catch (err) {
      console.error("Gagal mengunduh IDML:", err.message);
      if (err.response && err.response.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorObj = JSON.parse(reader.result);
            alert(`Gagal mengunduh file IDML: ${errorObj.message || "Terjadi kesalahan"}`);
          } catch (e) {
            alert("Gagal mengunduh file IDML.");
          }
        };
        reader.readAsText(err.response.data);
      } else {
        alert("Gagal mengunduh file IDML.");
      }
    }
  };

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
      <p className={styles.sectionTitle}>Histori Analisis</p>
      {loading ? (
        <div style={{ marginTop: '12px' }}>
          <Skeleton height="200px" />
        </div>
      ) : error ? (
        <p style={{ color: "#ef4444", fontSize: "14px" }}>{error}</p>
      ) : historyList.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>Belum ada riwayat analisis.</p>
      ) : (
        <div className={styles.tableResponsive}>
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th className={styles.noCol}>No</th>
                <th>Judul</th>
                <th>Periode</th>
                <th>Tanggal Dibuat</th>
                <th style={{ textAlign: "center", width: "100px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {historyList.slice(0, 5).map((item, index) => (
                <tr key={item._id || index}>
                  <td className={styles.noCol}>{index + 1}</td>
                  <td>{item.title}</td>
                  <td>{item.periode}</td>
                  <td>{formatTanggal(item.createdAt)}</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => handleDownloadIDML(item._id, item.title)}
                      style={{
                        background: 'transparent',
                        
                        color: '#34B34A',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(52,179,74,0.1)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      IDML
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
