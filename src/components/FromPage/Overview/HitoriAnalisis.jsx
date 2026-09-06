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

  const handleDownload = async (id, title, format = "docx") => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_URL_SERVER}/api/users/analysis/${id}/download/${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      const ext = format.toLowerCase();
      const mimeType = ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const blob = new Blob([response.data], { type: mimeType });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`;
      link.click();
    } catch (err) {
      console.error(`Gagal mengunduh ${format.toUpperCase()}:`, err.message);
      alert(`Gagal mengunduh file ${format.toUpperCase()}.`);
    }
  };

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
      alert("Gagal mengunduh file IDML.");
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
                <th style={{ textAlign: "center", width: "140px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {historyList.slice(0, 5).map((item, index) => {
                const isLegacyIdml = item.analysisFile && item.analysisFile.endsWith(".idml") && !item.docxFile;
                return (
                  <tr key={item._id || index}>
                    <td className={styles.noCol}>{index + 1}</td>
                    <td>{item.title}</td>
                    <td>{item.periode}</td>
                    <td>{formatTanggal(item.createdAt)}</td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                        {isLegacyIdml ? (
                          <button
                            onClick={() => handleDownloadIDML(item._id, item.title)}
                            style={{
                              background: 'transparent',
                              color: '#34B34A',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: '1px solid rgba(52,179,74,0.4)',
                            }}
                          >
                            IDML
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleDownload(item._id, item.title, "docx")}
                              style={{
                                background: 'rgba(59, 130, 246, 0.12)',
                                border: '1px solid rgba(59, 130, 246, 0.4)',
                                color: '#60a5fa',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                              title="Unduh DOCX"
                            >
                              DOCX
                            </button>
                            <button
                              onClick={() => handleDownload(item._id, item.title, "pdf")}
                              style={{
                                background: 'rgba(239, 68, 68, 0.12)',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                color: '#f87171',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                              title="Unduh PDF"
                            >
                              PDF
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
