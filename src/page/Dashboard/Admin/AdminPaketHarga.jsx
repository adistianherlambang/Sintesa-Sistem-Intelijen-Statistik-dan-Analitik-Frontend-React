import { useState, useEffect } from "react";
import axios from "axios";
import Wrapper from "../../../components/Wrapper/Wrapper";
import styles from "./AdminPaketHarga.module.css";

export default function AdminPaketHarga() {
  const [stats, setStats] = useState({
    activeSubscribers: 0,
    totalRevenue: 0,
    totalUsers: 0,
    recentTransactions: []
  });
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit Modal state
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: 0,
    billingPeriod: "monthly",
    quotaWord: 0,
    quotaPdf: 0,
    description: "",
    isActive: true
  });
  const [saving, setSaving] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

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
        axios.get("/api/admin/stats", getHeaders()),
        axios.get("/api/admin/packages", getHeaders())
      ]);

      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }
      if (pkgsRes.data?.data) {
        setPackages(pkgsRes.data.data);
      }
    } catch (err) {
      console.error("Gagal memuat data paket & harga:", err);
      setError(err.response?.data?.message || "Gagal memuat data. Pastikan Anda memiliki akses Admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEdit = (pkg) => {
    setSelectedPkg(pkg);
    setEditForm({
      name: pkg.name || "",
      price: pkg.price || 0,
      billingPeriod: pkg.billingPeriod || "monthly",
      quotaWord: pkg.quota?.word ?? 0,
      quotaPdf: pkg.quota?.pdf ?? 0,
      description: pkg.description || "",
      isActive: pkg.isActive !== false
    });
    setModalMessage("");
  };

  const handleCloseEdit = () => {
    setSelectedPkg(null);
    setModalMessage("");
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    if (!selectedPkg) return;

    try {
      setSaving(true);
      setModalMessage("");
      const res = await axios.put(
        `/api/admin/packages/${selectedPkg.planId}`,
        {
          name: editForm.name,
          price: Number(editForm.price),
          billingPeriod: editForm.billingPeriod,
          quota: {
            word: Number(editForm.quotaWord),
            pdf: Number(editForm.quotaPdf)
          },
          description: editForm.description,
          isActive: editForm.isActive
        },
        getHeaders()
      );

      if (res.data?.success) {
        handleCloseEdit();
        fetchData();
      }
    } catch (err) {
      setModalMessage(err.response?.data?.message || "Gagal memperbarui paket.");
    } finally {
      setSaving(false);
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
          Kelola harga paket langganan, kuota ekspor, serta pantau transaksi dan langganan aktif pengguna.
        </p>
      </div>

      {error && (
        <Wrapper style={{ borderColor: "#ef4444", background: "rgba(239, 68, 68, 0.08)" }}>
          <p style={{ color: "#ef4444", margin: 0 }}>{error}</p>
        </Wrapper>
      )}

      {/* METRIC OVERVIEW */}
      <div className={styles.metricGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Pengguna</span>
          <h2 className={styles.metricValue}>{stats.totalUsers}</h2>
          <span className={styles.metricSub}>Terdaftar di sistem</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Langganan Aktif</span>
          <h2 className={styles.metricValue}>{stats.activeSubscribers}</h2>
          <span className={styles.metricSub}>Berlangganan saat ini</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Pendapatan</span>
          <h2 className={styles.metricValue}>{formatRupiah(stats.totalRevenue)}</h2>
          <span className={styles.metricSub}>Dari transaksi berhasil</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Status Paket</span>
          <h2 className={styles.metricValue}>{packages.filter((p) => p.isActive).length} Aktif</h2>
          <span className={styles.metricSub}>Dari {packages.length} tier paket</span>
        </div>
      </div>

      {/* DAFTAR PAKET */}
      <Wrapper>
        <h2 className={styles.sectionTitle}>Konfigurasi Paket &amp; Harga</h2>
        <p className={styles.subText}>
          Ubah besaran harga dan kuota ekspor (Word &amp; PDF) yang berlaku untuk pengguna.
        </p>

        {loading ? (
          <p style={{ color: "#888" }}>Memuat daftar paket...</p>
        ) : (
          <div className={styles.packagesGrid}>
            {packages.map((pkg) => (
              <div key={pkg._id || pkg.planId} className={styles.packageCard}>
                <span className={styles.packageBadge}>
                  {pkg.isActive ? "Aktif" : "Nonaktif"}
                </span>
                <div>
                  <h3 className={styles.packageName}>{pkg.name}</h3>
                  <div className={styles.packageCategory}>{pkg.planId.toUpperCase()}</div>
                  <p className={styles.packagePrice}>
                    {pkg.price === 0 ? "Gratis" : formatRupiah(pkg.price)}
                    {pkg.price > 0 && (
                      <span className={styles.packagePeriod}> /{pkg.billingPeriod}</span>
                    )}
                  </p>
                </div>

                <div className={styles.packageMeta}>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Kuota Ekspor Word</span>
                    <span className={styles.metaVal}>
                      {pkg.quota?.word === -1 ? "Tak Terbatas" : `${pkg.quota?.word} / bln`}
                    </span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Kuota Ekspor PDF</span>
                    <span className={styles.metaVal}>
                      {pkg.quota?.pdf === -1 ? "Tak Terbatas" : `${pkg.quota?.pdf} / bln`}
                    </span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>AI Forecasting</span>
                    <span className={styles.metaVal}>Tersedia</span>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => handleOpenEdit(pkg)}
                >
                  Edit Paket &amp; Harga
                </button>
              </div>
            ))}
          </div>
        )}
      </Wrapper>

      {/* RIWAYAT TRANSAKSI TERAKHIR */}
      <Wrapper>
        <h2 className={styles.sectionTitle}>Riwayat Transaksi Terbaru</h2>
        <p className={styles.subText}>10 transaksi langganan terkini di seluruh platform.</p>

        <div className={styles.tableResponsive}>
          <table className={styles.customTable}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Pengguna</th>
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
                      {tx.orderId || "-"}
                    </td>
                    <td>{tx.userId?.email || tx.userId?.profile?.name || "User"}</td>
                    <td>{tx.planId}</td>
                    <td>{formatRupiah(tx.amount)}</td>
                    <td>
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td>
                      <span
                        className={
                          tx.status === "settlement" || tx.status === "capture"
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
                    Belum ada transaksi terekam.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Wrapper>

      {/* MODAL EDIT PAKET */}
      {selectedPkg && (
        <div className={styles.modalOverlay} onClick={handleCloseEdit}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Edit Paket: {selectedPkg.name}</h3>

            {modalMessage && (
              <p style={{ color: "#ef4444", margin: 0, fontSize: "13px" }}>{modalMessage}</p>
            )}

            <form onSubmit={handleSavePackage} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nama Tampilan Paket</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Harga Paket (Rp)</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  min="0"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Kuota Word (-1 = Tak Terbatas)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={editForm.quotaWord}
                    onChange={(e) => setEditForm({ ...editForm, quotaWord: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Kuota PDF (-1 = Tak Terbatas)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={editForm.quotaPdf}
                    onChange={(e) => setEditForm({ ...editForm, quotaPdf: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Periode Tagihan</label>
                <select
                  className={styles.formInput}
                  value={editForm.billingPeriod}
                  onChange={(e) => setEditForm({ ...editForm, billingPeriod: e.target.value })}
                >
                  <option value="monthly">Bulanan (Monthly)</option>
                  <option value="quarterly">3 Bulan (Quarterly)</option>
                  <option value="yearly">Tahunan (Yearly)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status Aktif</label>
                <select
                  className={styles.formInput}
                  value={editForm.isActive ? "true" : "false"}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === "true" })}
                >
                  <option value="true">Aktif (Bisa Dibeli User)</option>
                  <option value="false">Nonaktif (Disembunyikan)</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={handleCloseEdit}
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={styles.btnSave}
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
