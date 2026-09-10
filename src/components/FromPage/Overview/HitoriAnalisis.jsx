import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./HitoriAnalisis.module.css";
import Skeleton from "../../Skeleton/Skeleton";

export default function HitoriAnalisis({ onLoad, limit, isOverview = false }) {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(null); // { id, format }

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
        const data = Array.isArray(response.data) ? response.data : [];
        setHistoryList(data);
        if (onLoad) onLoad(data);
      } catch (err) {
        console.error("Gagal memuat histori analisis:", err.message);
        setError("Gagal memuat histori analisis.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [onLoad]);

  const handleDownload = async (id, title, format = "docx") => {
    setDownloading({ id, format });
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_URL_SERVER}/api/users/analysis/${id}/download/${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const ext = format.toLowerCase();
      const mimeType =
        ext === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const blob = new Blob([response.data], { type: mimeType });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${(title || "Laporan_Analisis").replace(/[^a-zA-Z0-9]/g, "_")}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error(`Gagal mengunduh ${format.toUpperCase()}:`, err.message);
      let errorMsg = `Gagal mengunduh file ${format.toUpperCase()}.`;
      if (err.response && err.response.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json.message) errorMsg = json.message;
        } catch {
          // ignore parsing error
        }
      } else if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      }
      alert(errorMsg);
    } finally {
      setDownloading(null);
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
      year: "numeric",
    }).replace(/\./g, ":");
  };

  const displayList = limit ? historyList.slice(0, limit) : historyList;

  return (
    <div className={styles.content}>
      <div className={styles.titleRow}>
        <p className={styles.sectionTitle}>Histori Analisis</p>
        {isOverview && (
          <button
            className={styles.seeAllBtn}
            onClick={() => navigate("/dashboard/workspace/histori")}
          >
            Lihat Semua →
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ marginTop: "12px" }}>
          <Skeleton height="200px" />
        </div>
      ) : error ? (
        <p style={{ color: "#ef4444", fontSize: "14px" }}>{error}</p>
      ) : displayList.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
          Belum ada riwayat analisis.
        </p>
      ) : (
        <div className={styles.tableResponsive}>
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th className={styles.noCol}>No</th>
                <th>Judul</th>
                <th>Periode</th>
                <th>Tanggal Dibuat</th>
                <th style={{ textAlign: "center", width: "160px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map((item, index) => {
                const isDownloadingPdf =
                  downloading && downloading.id === item._id && downloading.format === "pdf";
                const isDownloadingDocx =
                  downloading && downloading.id === item._id && downloading.format === "docx";

                return (
                  <tr key={item._id || index}>
                    <td className={styles.noCol}>{index + 1}</td>
                    <td>{item.title}</td>
                    <td>{item.periode}</td>
                    <td>{formatTanggal(item.createdAt)}</td>
                    <td style={{ textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <button
                          onClick={() => handleDownload(item._id, item.title, "pdf")}
                          className={`${styles.btnDownloadPdf} ${isDownloadingPdf ? styles.btnDownloadDisabled : ""}`}
                          disabled={isDownloadingPdf}
                          title="Unduh PDF"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          {isDownloadingPdf ? "..." : "PDF"}
                        </button>
                        <button
                          onClick={() => handleDownload(item._id, item.title, "docx")}
                          className={`${styles.btnDownloadDocx} ${isDownloadingDocx ? styles.btnDownloadDisabled : ""}`}
                          disabled={isDownloadingDocx}
                          title="Unduh DOCX"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          {isDownloadingDocx ? "..." : "DOCX"}
                        </button>
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
