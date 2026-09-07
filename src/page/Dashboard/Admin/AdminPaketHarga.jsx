import { useState, useEffect } from "react";
import axios from "axios";
import Wrapper from "../../../components/Wrapper/Wrapper";
import styles from "./AdminPaketHarga.module.css";

export default function AdminPaketHarga() {
  const [stats, setStats] = useState({
    activeSubscribers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    totalUsers: 0,
    recentTransactions: []
  });
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [savingPlanId, setSavingPlanId] = useState("");

  const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [statsRes, pkgsRes] = await Promise.all([
        axios.get(`${serverUrl}/api/admin/stats`, getHeaders()),
        axios.get(`${serverUrl}/api/admin/packages`, getHeaders())
      ]);

      const statsData = statsRes.data?.data || statsRes.data?.stats;
      if (statsData) {
        setStats({
          ...statsData,
          activeSubscribers: statsData.activeSubscribers ?? statsData.activeSubscriptions ?? 0
        });
      }

      const pkgsData = pkgsRes.data?.data || pkgsRes.data?.packages;
      if (Array.isArray(pkgsData)) {
        setPackages(
          pkgsData.map((p) => ({
            ...p,
            editName: p.name || "",
            editAmount: p.amount ?? p.price ?? 0,
            editQuota: p.quota ?? 30,
            editIsActive: p.isActive !== false
          }))
        );
      }
    } catch (err) {
      console.error("Gagal memuat data paket & harga:", err);
      setError(
        err.response?.data?.message ||
        "Gagal memuat data. Pastikan Anda masuk sebagai akun Administrator."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePackageFieldChange = (planId, field, val) => {
    setPackages((prev) =>
      prev.map((p) => (p.planId === planId ? { ...p, [field]: val } : p))
    );
  };

  const handleSavePackageDirect = async (pkg) => {
    try {
      setSavingPlanId(pkg.planId);
      setError("");
      setSuccessMsg("");

      const res = await axios.put(
        `${serverUrl}/api/admin/packages/${pkg.planId}`,
        {
          name: pkg.editName,
          amount: Number(pkg.editAmount),
          price: Number(pkg.editAmount),
          quota: Number(pkg.editQuota),
          isActive: Boolean(pkg.editIsActive)
        },
        getHeaders()
      );

      if (res.data?.success) {
        setSuccessMsg(`Konfigurasi paket "${pkg.editName}" berhasil disimpan!`);
        setTimeout(() => setSuccessMsg(""), 4000);
        fetchData();
      }
    } catch (err) {
      console.error("Gagal update paket:", err);
      setError(err.response?.data?.message || "Gagal memperbarui paket.");
    } finally {
      setSavingPlanId("");
    }
  };

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
        <h1 className={styles.tabTitle}>Monitor Paket &amp; Harga</h1>
        <p className={styles.subText}>
          Input langsung konfigurasi harga langganan, kuota, serta pantau transaksi dan langganan aktif pengguna.
        </p>
      </div>

      {error && (
        <Wrapper style={{ borderColor: "#ef4444", background: "rgba(239, 68, 68, 0.08)" }}>
          <p style={{ color: "#ef4444", margin: 0 }}>{error}</p>
        </Wrapper>
      )}

      {successMsg && (
        <Wrapper style={{ borderColor: "#34B34A", background: "rgba(52, 179, 74, 0.08)" }}>
          <p style={{ color: "#34B34A", margin: 0, fontWeight: 600 }}>{successMsg}</p>
        </Wrapper>
      )}

      {/* METRIC OVERVIEW */}
      <div className={styles.metricGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Pengguna</span>
          <h2 className={styles.metricValue}>{stats.totalUsers || 0}</h2>
          <span className={styles.metricSub}>Akun terdaftar</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Langganan Aktif</span>
          <h2 className={styles.metricValue}>{stats.activeSubscribers || 0}</h2>
          <span className={styles.metricSub}>Instansi aktif langganan</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Pendapatan</span>
          <h2 className={styles.metricValue}>{formatRupiah(stats.totalRevenue)}</h2>
          <span className={styles.metricSub}>Dari transaksi berhasil</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Status Paket</span>
          <h2 className={styles.metricValue}>
            {packages.filter((p) => p.isActive).length} Aktif
          </h2>
          <span className={styles.metricSub}>Dari {packages.length} tier paket</span>
        </div>
      </div>

      {/* KONFIGURASI PAKET (LANGSUNG INPUT) */}
      <Wrapper>
        <h2 className={styles.sectionTitle}>Konfigurasi Paket &amp; Harga (Input Langsung)</h2>
        <p className={styles.subText}>
          Ubah besaran harga (Rp) dan kuota interaksi / dokumen yang berlaku pada masing-masing paket.
        </p>

        {loading ? (
          <p style={{ color: "#888" }}>Memuat daftar paket...</p>
        ) : (
          <div className={styles.packagesGrid}>
            {packages.map((pkg) => {
              const isSaving = savingPlanId === pkg.planId;
              return (
                <div key={pkg._id || pkg.planId} className={styles.packageCard}>
                  <div className={styles.packageHeader}>
                    <span className={styles.planIdBadge}>{pkg.planId}</span>
                    <span className={styles.subscribersBadge}>
                      {pkg.activeSubscribers || 0} Pelanggan Aktif
                    </span>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Nama Tampilan Paket</label>
                    <input
                      type="text"
                      className={styles.cardInput}
                      value={pkg.editName}
                      onChange={(e) =>
                        handlePackageFieldChange(pkg.planId, "editName", e.target.value)
                      }
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Harga Paket (Rp)</label>
                    <input
                      type="number"
                      className={styles.cardInput}
                      value={pkg.editAmount}
                      min="0"
                      onChange={(e) =>
                        handlePackageFieldChange(pkg.planId, "editAmount", e.target.value)
                      }
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Kuota Bulanan/Harian</label>
                      <input
                        type="number"
                        className={styles.cardInput}
                        value={pkg.editQuota}
                        onChange={(e) =>
                          handlePackageFieldChange(pkg.planId, "editQuota", e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Status Layanan</label>
                      <select
                        className={styles.cardSelect}
                        value={pkg.editIsActive ? "true" : "false"}
                        onChange={(e) =>
                          handlePackageFieldChange(
                            pkg.planId,
                            "editIsActive",
                            e.target.value === "true"
                          )
                        }
                      >
                        <option value="true">Aktif</option>
                        <option value="false">Nonaktif</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.saveBtn}
                    onClick={() => handleSavePackageDirect(pkg)}
                    disabled={isSaving}
                  >
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Wrapper>

      {/* RIWAYAT TRANSAKSI TERAKHIR */}
      <Wrapper>
        <h2 className={styles.sectionTitle}>Riwayat Transaksi Terbaru</h2>
        <p className={styles.subText}>Transaksi langganan terkini yang tercatat pada sistem.</p>

        <div className={styles.tableResponsive}>
          <table className={styles.customTable}>
            <thead>
              <tr>
                <th>Invoice / ID</th>
                <th>Pengguna / Instansi</th>
                <th>Paket</th>
                <th>Jumlah</th>
                <th>Tanggal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((tx, idx) => (
                  <tr key={tx._id || idx}>
                    <td style={{ fontFamily: "monospace", color: "#34B34A" }}>
                      {tx.invoiceId || tx.orderId || "-"}
                    </td>
                    <td>
                      <div>{tx.userId?.profile?.name || tx.userId?.email || "Pengguna"}</div>
                      <div style={{ fontSize: "11px", color: "#888" }}>
                        {tx.userId?.location?.name || tx.userId?.email || ""}
                      </div>
                    </td>
                    <td>{tx.subscriptionId?.subscriptionId || tx.subscriptionId || tx.planId || "-"}</td>
                    <td style={{ fontWeight: 600 }}>{formatRupiah(tx.amount || tx.finalAmount)}</td>
                    <td>
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td>
                      <span
                        className={
                          tx.status === "paid" || tx.status === "settlement" || tx.status === "capture"
                            ? styles.statusPaid
                            : styles.statusPending
                        }
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", color: "#777", padding: "24px" }}>
                    Belum ada riwayat transaksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Wrapper>
    </div>
  );
}
