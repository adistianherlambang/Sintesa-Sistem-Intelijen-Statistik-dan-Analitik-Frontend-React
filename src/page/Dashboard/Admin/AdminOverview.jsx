import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Wrapper from "../../../components/Wrapper/Wrapper";
import Button from "../../../components/Button/Button";
import styles from "./AdminOverview.module.css";

export default function AdminOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    activeSubscribers: 0,
    totalRevenue: 0,
    totalAnalyses: 0,
    totalInfografis: 0,
    recentTransactions: [],
    features: { total: 5, active: 5 }
  });
  const [users, setUsers] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  useEffect(() => {
    const fetchAdminOverviewData = async () => {
      try {
        setLoading(true);
        setError("");
        const [statsRes, usersRes, featsRes] = await Promise.all([
          axios.get(`${serverUrl}/api/admin/stats`, getHeaders()),
          axios.get(`${serverUrl}/api/admin/users?limit=5`, getHeaders()),
          axios.get(`${serverUrl}/api/admin/features`, getHeaders())
        ]);

        const statsData = statsRes.data?.data || statsRes.data?.stats;
        if (statsData) {
          setStats({
            ...statsData,
            activeSubscribers: statsData.activeSubscribers ?? statsData.activeSubscriptions ?? 0
          });
        }

        const usersData = usersRes.data?.data?.users || usersRes.data?.users;
        if (Array.isArray(usersData)) {
          setUsers(usersData);
        }

        const featsData = featsRes.data?.data || featsRes.data?.features;
        if (Array.isArray(featsData)) {
          setFeatures(featsData);
        }
      } catch (err) {
        console.error("Gagal memuat admin overview:", err);
        setError(
          err.response?.data?.message ||
          "Gagal memuat data ringkasan admin. Pastikan Anda memiliki hak akses Administrator."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdminOverviewData();
  }, [serverUrl]);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num || 0);
  };

  return (
    <div className={styles.container}>
      <div>
        <h1 className={styles.tabTitle}>Overview</h1>
      </div>

      {error && (
        <Wrapper style={{ borderColor: "#ef4444", background: "rgba(239, 68, 68, 0.08)" }}>
          <p style={{ color: "#ef4444", margin: 0 }}>{error}</p>
        </Wrapper>
      )}

      {/* KPI METRICS */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Total Pengguna</span>
          <h2 className={styles.kpiValue}>{stats.totalUsers || 0}</h2>
          <span className={styles.kpiSub}>
            {stats.regularUsers || 0} Instansi &bull; {stats.adminUsers || 1} Admin
          </span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Langganan Aktif</span>
          <h2 className={styles.kpiValue}>{stats.activeSubscribers || 0}</h2>
          <span className={styles.kpiSub}>Instansi dengan paket aktif</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Total Revenue</span>
          <h2 className={styles.kpiValue}>{formatRupiah(stats.totalRevenue)}</h2>
          <span className={styles.kpiSub}>Dari transaksi pembayaran berhasil</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Dokumen BRS &amp; Infografis</span>
          <h2 className={styles.kpiValue}>
            {(stats.totalAnalyses || 0) + (stats.totalInfografis || 0)}
          </h2>
          <span className={styles.kpiSub}>
            {stats.totalAnalyses || 0} Analisis BRS &bull; {stats.totalInfografis || 0} Infografis
          </span>
        </div>
      </div>

      {/* 2-COLUMN: KONTROL PENGGUNA & KONTROL DATASET */}
      <div className={styles.splitGrid}>
        {/* KONTROL PENGGUNA */}
        <Wrapper>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
              Kontrol Pengguna &amp; Instansi
            </h2>
            <Button
              size="sm"
              onClick={() => navigate("/dashboard/admin/manajemenUser")}
            >
              Kelola Pengguna &rarr;
            </Button>
          </div>

          <div className={styles.tableResponsive}>
            <table className={styles.customTable}>
              <thead>
                <tr>
                  <th>Pengguna / Email</th>
                  <th>Instansi / Wilayah</th>
                  <th>Role</th>
                  <th>Status Paket</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u._id || u.userId}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#fff" }}>
                          {u.profile?.name || u.email}
                        </div>
                        <div style={{ fontSize: "11px", color: "#888" }}>{u.email}</div>
                      </td>
                      <td>{u.location?.name || u.profile?.instansiType || "Pusat"}</td>
                      <td>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: u.role === "admin" ? "#ef4444" : "#34B34A",
                            textTransform: "uppercase"
                          }}
                        >
                          {u.role || "user"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: u.subscription?.status === "active" ? "#34B34A" : "#888" }}>
                          {u.subscription?.status === "active" ? "Aktif" : "Free / Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", color: "#888", padding: "16px" }}>
                      {loading ? "Memuat..." : "Belum ada data pengguna."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Wrapper>

        {/* KONTROL DATASET STATISTIK */}
        <Wrapper>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
              Kontrol Dataset &amp; Indikator BPS
            </h2>
            <span style={{ fontSize: "12px", color: "#34B34A", fontWeight: 600 }}>API BPS Terhubung</span>
          </div>

          <div className={styles.datasetList}>
            <div className={styles.datasetItem}>
              <div>
                <h4 className={styles.datasetName}>Indikator Inflasi &amp; IHK Komoditas</h4>
                <p className={styles.datasetDesc}>
                  Data BPS bulanan, pengelompokan 5 komoditas dominan, dan proyeksi AI Holt-Winters.
                </p>
              </div>
              <span style={{ fontSize: "12px", color: "#34B34A", fontWeight: 600 }}>Aktif</span>
            </div>

            <div className={styles.datasetItem}>
              <div>
                <h4 className={styles.datasetName}>Indikator Kemiskinan (Susenas)</h4>
                <p className={styles.datasetDesc}>
                  Data Susenas tahunan: Persentase (P0), Garis Kemiskinan (GK), &amp; Indeks Kedalaman.
                </p>
              </div>
              <span style={{ fontSize: "12px", color: "#34B34A", fontWeight: 600 }}>Aktif</span>
            </div>

            <div className={styles.datasetItem}>
              <div>
                <h4 className={styles.datasetName}>Indikator PDRB Pengeluaran ADHK</h4>
                <p className={styles.datasetDesc}>
                  Data agregat PDRB tahunan atas dasar harga konstan per wilayah instansi.
                </p>
              </div>
              <span style={{ fontSize: "12px", color: "#34B34A", fontWeight: 600 }}>Aktif</span>
            </div>
          </div>
        </Wrapper>
      </div>

      {/* 2-COLUMN: KONTROL REVENUE & KONTROL FITUR */}
      <div className={styles.splitGrid}>
        {/* KONTROL REVENUE & TRANSAKSI */}
        <Wrapper>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
              Kontrol Pendapatan &amp; Transaksi
            </h2>
            <Button
              size="sm"
              onClick={() => navigate("/dashboard/admin/paketDanHarga")}
            >
              Monitor Paket &amp; Harga &rarr;
            </Button>
          </div>

          <div className={styles.tableResponsive}>
            <table className={styles.customTable}>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Instansi</th>
                  <th>Jumlah</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
                  stats.recentTransactions.slice(0, 5).map((tx, idx) => (
                    <tr key={tx._id || idx}>
                      <td style={{ fontFamily: "monospace", color: "#34B34A" }}>
                        {tx.invoiceId || tx.orderId || "-"}
                      </td>
                      <td>{tx.userId?.profile?.name || tx.userId?.email || "User"}</td>
                      <td style={{ fontWeight: 600 }}>{formatRupiah(tx.amount || tx.finalAmount)}</td>
                      <td>
                        <span
                          style={{
                            fontSize: "12px",
                            color:
                              tx.status === "paid" || tx.status === "settlement"
                                ? "#34B34A"
                                : "#f59e0b",
                            fontWeight: 600,
                            textTransform: "capitalize"
                          }}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", color: "#888", padding: "16px" }}>
                      Belum ada transaksi pembayaran.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Wrapper>

        {/* KONTROL SAKELAR FITUR */}
        <Wrapper>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
              Status Fitur Sistem ({stats.features?.active || 0}/{stats.features?.total || 5} Aktif)
            </h2>
            <Button
              size="sm"
              onClick={() => navigate("/dashboard/admin/kontrolFitur")}
            >
              Sakelar Fitur &rarr;
            </Button>
          </div>

          <div className={styles.datasetList}>
            {features.map((f) => (
              <div key={f.featureId} className={styles.datasetItem}>
                <div>
                  <h4 className={styles.datasetName}>{f.name}</h4>
                  <p className={styles.datasetDesc}>{f.description}</p>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: f.enabled ? "#34B34A" : "#ef4444"
                  }}
                >
                  {f.enabled ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            ))}
          </div>
        </Wrapper>
      </div>
    </div>
  );
}
