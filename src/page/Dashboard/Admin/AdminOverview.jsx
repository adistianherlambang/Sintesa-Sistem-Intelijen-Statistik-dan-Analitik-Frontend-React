import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
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
    features: { total: 5, active: 5 },
    revenueTrend: [],
    serverUsage: null
  });
  const [liveServerUsage, setLiveServerUsage] = useState(null);
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
          if (statsData.serverUsage) {
            setLiveServerUsage(statsData.serverUsage);
          }
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

  // Real-time server utility metrics subscriber (SSE with automatic polling fallback)
  useEffect(() => {
    let isMounted = true;
    let eventSource = null;
    let pollInterval = null;

    const token = localStorage.getItem("token");
    if (!token) return;

    const startPolling = () => {
      if (pollInterval) return;
      const poll = async () => {
        if (!isMounted || (typeof document !== "undefined" && document.visibilityState === "hidden")) {
          return;
        }
        try {
          const res = await axios.get(`${serverUrl}/api/admin/server-usage`, getHeaders());
          if (isMounted && res.data?.serverUsage) {
            setLiveServerUsage(res.data.serverUsage);
          }
        } catch (err) {
          // ignore poll error
        }
      };

      poll();
      pollInterval = setInterval(poll, 2000);
    };

    const startSSE = () => {
      try {
        const sseUrl = `${serverUrl}/api/admin/server-usage/stream?token=${encodeURIComponent(token)}`;
        eventSource = new EventSource(sseUrl);

        eventSource.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data && data.cpu) {
              setLiveServerUsage(data);
            }
          } catch (e) { }
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (isMounted) {
            startPolling();
          }
        };
      } catch (err) {
        startPolling();
      }
    };

    if (typeof EventSource !== "undefined") {
      startSSE();
    } else {
      startPolling();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isMounted && !eventSource) {
        axios.get(`${serverUrl}/api/admin/server-usage`, getHeaders())
          .then((res) => {
            if (isMounted && res.data?.serverUsage) {
              setLiveServerUsage(res.data.serverUsage);
            }
          })
          .catch(() => { });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (eventSource) {
        eventSource.close();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [serverUrl]);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num || 0);
  };

  const formatYAxisRupiah = (val) => {
    if (!val || val === 0) return "Rp 0";
    if (val >= 1000000) {
      return `Rp ${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)} jt`;
    }
    if (val >= 1000) {
      return `Rp ${(val / 1000).toFixed(0)} rb`;
    }
    return `Rp ${val}`;
  };

  const CustomRevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className={styles.chartTooltip}>
          <p className={styles.chartTooltipTitle}>{item.payload?.label || label}</p>
          <div className={styles.chartTooltipRow}>
            <span className={styles.chartTooltipDot} />
            <span style={{ fontWeight: 700 }}>{formatRupiah(item.value)}</span>
          </div>
          <div className={styles.chartTooltipSub}>
            {item.payload?.count || 0} Transaksi Pembayaran
          </div>
        </div>
      );
    }
    return null;
  };

  // Safe server usage values (supports real-time live streaming)
  const currentServerUsage = liveServerUsage || stats.serverUsage || {};
  const serverUsage = currentServerUsage;
  const cpu = currentServerUsage.cpu || { usagePercent: 0, cores: 1, model: "-", loadAvg: ["0.00", "0.00", "0.00"] };
  const memory = currentServerUsage.memory || { usagePercent: 0, totalFormatted: "-", usedFormatted: "-", freeFormatted: "-" };
  const storage = currentServerUsage.storage || { usagePercent: 0, totalFormatted: "-", usedFormatted: "-", freeFormatted: "-" };
  const uptime = currentServerUsage.uptime || { formatted: "-" };

  // Helper for progress bar classes based on load percentage
  const getPercentClass = (val) => {
    if (val >= 85) return styles.serverPercentDanger;
    if (val >= 65) return styles.serverPercentWarning;
    return "";
  };

  const getProgressFillClass = (val) => {
    if (val >= 85) return styles.progressBarFillDanger;
    if (val >= 65) return styles.progressBarFillWarning;
    return "";
  };

  const revenueTrendData = stats.revenueTrend && stats.revenueTrend.length > 0
    ? stats.revenueTrend
    : [
      { label: "Bulan 1", revenue: 0, count: 0 },
      { label: "Bulan 2", revenue: 0, count: 0 },
      { label: "Bulan 3", revenue: 0, count: 0 },
      { label: "Bulan 4", revenue: 0, count: 0 },
      { label: "Bulan 5", revenue: 0, count: 0 },
      { label: "Bulan 6", revenue: 0, count: 0 }
    ];

  const totalPeriodRevenue = revenueTrendData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const avgPeriodRevenue = Math.round(totalPeriodRevenue / Math.max(1, revenueTrendData.length));

  return (
    <div className={styles.container}>
      <div>
        <h1 className={styles.tabTitle}>Overview</h1>
      </div>

      {error && (
        <Wrapper border={"none"} style={{ background: "rgba(239, 68, 68, 0.08)" }}>
          <p style={{ color: "#ef4444", margin: 0 }}>{error}</p>
        </Wrapper>
      )}

      {/* KPI METRICS */}
      <div className={styles.kpiGrid}>
        <Wrapper border={"none"}>
          <div className={styles.kpiUtama}>
            <div className={styles.kpiContainer}>
              <p className={styles.kpiTitle}>Total Pengguna</p>
              <h1 className={styles.kpiValue}>{stats.totalUsers || 0}</h1>
              <div className={styles.kpiComparison}>
                {stats.regularUsers || 0} Instansi &bull; {stats.adminUsers || 1} Admin
              </div>
            </div>
          </div>
        </Wrapper>

        <Wrapper border={"none"}>
          <div className={styles.kpiUtama}>
            <div className={styles.kpiContainer}>
              <p className={styles.kpiTitle}>Langganan Aktif</p>
              <h1 className={styles.kpiValue}>{stats.activeSubscribers || 0}</h1>
              <div className={styles.kpiComparison}>
                Instansi dengan paket aktif
              </div>
            </div>
          </div>
        </Wrapper>

        <Wrapper border={"none"}>
          <div className={styles.kpiUtama}>
            <div className={styles.kpiContainer}>
              <p className={styles.kpiTitle}>Total Revenue</p>
              <h1 className={styles.kpiValue}>{formatRupiah(stats.totalRevenue)}</h1>
              <div className={styles.kpiComparison}>
                Transaksi pembayaran berhasil
              </div>
            </div>
          </div>
        </Wrapper>

        <Wrapper border={"none"}>
          <div className={styles.kpiUtama}>
            <div className={styles.kpiContainer}>
              <p className={styles.kpiTitle}>Dokumen BRS &amp; Infografis</p>
              <h1 className={styles.kpiValue}>
                {(stats.totalAnalyses || 0) + (stats.totalInfografis || 0)}
              </h1>
              <div className={styles.kpiComparison}>
                {stats.totalAnalyses || 0} Analisis BRS &bull; {stats.totalInfografis || 0} Infografis
              </div>
            </div>
          </div>
        </Wrapper>
      </div>

      {/* REVENUE GRAPH */}
      <Wrapper border={"none"}>
        <div className={styles.chartHeader}>
          <p className={styles.sectionTitle} style={{ margin: 0 }}>
            Tren Pendapatan Langganan
          </p>

          <div className={styles.chartHeaderStats}>
            <div className={styles.chartHeaderStatItem}>
              <span className={styles.statMiniLabel}>Total 6 Bulan</span>
              <span className={styles.statMiniValue}>{formatRupiah(totalPeriodRevenue)}</span>
            </div>
            <div className={styles.chartHeaderStatItem}>
              <span className={styles.statMiniLabel}>Rata-Rata / Bulan</span>
              <span className={styles.statMiniValue} style={{ color: "#e5e5e5" }}>
                {formatRupiah(avgPeriodRevenue)}
              </span>
            </div>
          </div>
        </div>

        <div
          className={styles.chartContainer}
          style={{ cursor: "default", userSelect: "none" }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34B34A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#34B34A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="rgba(255, 255, 255, 0.4)"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
              />
              <YAxis
                stroke="rgba(255, 255, 255, 0.4)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxisRupiah}
                width={55}
              />
              <Tooltip content={<CustomRevenueTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#34B34A"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#adminRevenueGradient)"
                activeDot={{ r: 6, fill: "#34B34A", stroke: "#fff", strokeWidth: 2, cursor: "default" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Wrapper>

      {/* SERVER USAGE MONITORING (CPU, MEMORY, STORAGE) */}
      <Wrapper border={"none"}>
        <div className={styles.serverHeader}>
          <p className={styles.sectionTitle} style={{ margin: 0 }}>
            Status &amp; Utilitas Server
          </p>
        </div>

        <div className={styles.serverGrid}>
          {/* CPU USAGE */}
          <Wrapper border={"none"} className={styles.serverCard} padding="18px">
            <div className={styles.serverCardTop}>
              <span className={styles.serverCardTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34B34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="9" y="9" width="6" height="6" />
                  <line x1="9" y1="1" x2="9" y2="4" />
                  <line x1="15" y1="1" x2="15" y2="4" />
                  <line x1="9" y1="20" x2="9" y2="23" />
                  <line x1="15" y1="20" x2="15" y2="23" />
                  <line x1="20" y1="9" x2="23" y2="9" />
                  <line x1="20" y1="14" x2="23" y2="14" />
                  <line x1="1" y1="9" x2="4" y2="9" />
                  <line x1="1" y1="14" x2="4" y2="14" />
                </svg>
                Prosesor (CPU)
              </span>
              <span className={`${styles.serverPercent} ${getPercentClass(cpu.usagePercent)}`}>
                {cpu.usagePercent}%
              </span>
            </div>
            <div className={styles.progressBarTrack}>
              <div
                className={`${styles.progressBarFill} ${getProgressFillClass(cpu.usagePercent)}`}
                style={{ width: `${Math.min(100, Math.max(0, cpu.usagePercent))}%` }}
              />
            </div>
            <div className={styles.serverCardDetail}>
              <div>{cpu.cores} Core ({cpu.model})</div>
              <div style={{ marginTop: "3px", color: "rgba(255, 255, 255, 0.4)" }}>
                Load Avg: {cpu.loadAvg?.join(" • ") || "-"}
              </div>
            </div>
          </Wrapper>

          {/* MEMORY USAGE */}
          <Wrapper border={"none"} className={styles.serverCard} padding="18px">
            <div className={styles.serverCardTop}>
              <span className={styles.serverCardTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34B34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 19v-3" />
                  <path d="M10 19v-3" />
                  <path d="M14 19v-3" />
                  <path d="M18 19v-3" />
                  <path d="M6 5v3" />
                  <path d="M10 5v3" />
                  <path d="M14 5v3" />
                  <path d="M18 5v3" />
                  <rect x="2" y="8" width="20" height="8" rx="1" />
                </svg>
                Memori (RAM)
              </span>
              <span className={`${styles.serverPercent} ${getPercentClass(memory.usagePercent)}`}>
                {memory.usagePercent}%
              </span>
            </div>
            <div className={styles.progressBarTrack}>
              <div
                className={`${styles.progressBarFill} ${getProgressFillClass(memory.usagePercent)}`}
                style={{ width: `${Math.min(100, Math.max(0, memory.usagePercent))}%` }}
              />
            </div>
            <div className={styles.serverCardDetail}>
              <div>{memory.usedFormatted} dari {memory.totalFormatted}</div>
              <div style={{ marginTop: "3px", color: "rgba(255, 255, 255, 0.4)" }}>
                Tersedia: {memory.freeFormatted}
              </div>
            </div>
          </Wrapper>

          {/* STORAGE USAGE */}
          <Wrapper border={"none"} className={styles.serverCard} padding="18px">
            <div className={styles.serverCardTop}>
              <span className={styles.serverCardTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34B34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="12" x2="2" y2="12" />
                  <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                  <line x1="6" y1="16" x2="6.01" y2="16" />
                  <line x1="10" y1="16" x2="10.01" y2="16" />
                </svg>
                Penyimpanan (Disk)
              </span>
              <span className={`${styles.serverPercent} ${getPercentClass(storage.usagePercent)}`}>
                {storage.usagePercent}%
              </span>
            </div>
            <div className={styles.progressBarTrack}>
              <div
                className={`${styles.progressBarFill} ${getProgressFillClass(storage.usagePercent)}`}
                style={{ width: `${Math.min(100, Math.max(0, storage.usagePercent))}%` }}
              />
            </div>
            <div className={styles.serverCardDetail}>
              <div>{storage.usedFormatted} dari {storage.totalFormatted}</div>
              <div style={{ marginTop: "3px", color: "rgba(255, 255, 255, 0.4)" }}>
                Tersedia: {storage.freeFormatted}
              </div>
            </div>
          </Wrapper>
        </div>

        <div className={styles.serverFooterMeta}>
          <div className={styles.serverMetaItem}>
            <span>Uptime:</span>
            <span className={styles.serverMetaValue}>
              {typeof uptime === "object" ? (uptime.formatted || "-") : (uptime || "-")}
            </span>
          </div>
          <div className={styles.serverMetaItem}>
            <span>Platform:</span>
            <span className={styles.serverMetaValue}>{serverUsage.platform || "-"}</span>
          </div>
          <div className={styles.serverMetaItem}>
            <span>Node.js:</span>
            <span className={styles.serverMetaValue}>{serverUsage.nodeVersion || "-"}</span>
          </div>
        </div>
      </Wrapper>

      {/* 2-COLUMN: KONTROL PENGGUNA & KONTROL DATASET */}
      <div className={styles.splitGrid}>
        {/* KONTROL PENGGUNA */}
        <Wrapper border={"none"}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <p className={styles.sectionTitle} style={{ margin: 0 }}>
              Kontrol Pengguna
            </p>
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
                            color: u.role === "admin" ? "#ef4444" : "#34B34A"
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
        <Wrapper border={"none"}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p className={styles.sectionTitle} style={{ margin: 0 }}>
              Kontrol Dataset
            </p>
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
        <Wrapper border={"none"}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <p className={styles.sectionTitle} style={{ margin: 0 }}>
              Kontrol Pendapatan
            </p>
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
        <Wrapper border={"none"}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <p className={styles.sectionTitle} style={{ margin: 0 }}>
              Status Fitur Sistem ({stats.features?.active || 0}/{stats.features?.total || 5} Aktif)
            </p>
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
