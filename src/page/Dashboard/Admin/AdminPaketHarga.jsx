import { useState, useEffect } from "react";
import axios from "axios";
import Wrapper from "../../../components/Wrapper/Wrapper";
import Button from "../../../components/Button/Button";
import SearchableSelect from "../../../components/SearchableSelect/SearchableSelect";
import Checkbox from "../../../components/Checkbox/Checkbox";
import styles from "./AdminPaketHarga.module.css";

const AVAILABLE_FEATURES = [
  { id: "analisis", label: "Workspace Analisis BRS" },
  { id: "bot", label: "Bot WhatsApp" },
  { id: "infografis", label: "Infografis BRS" },
];

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
  const [deletingPlanId, setDeletingPlanId] = useState("");

  // Add Package Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [creatingPkg, setCreatingPkg] = useState(false);
  const [newPkgForm, setNewPkgForm] = useState({
    name: "",
    planId: "",
    amount: 50000,
    quota: 30,
    durationDays: 30,
    isActive: true,
    features: ["analisis", "bot"]
  });

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
            editIsActive: p.isActive !== false,
            editFeatures: Array.isArray(p.features) ? p.features : []
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

  const handleTogglePackageFeature = (planId, featureId) => {
    setPackages((prev) =>
      prev.map((p) => {
        if (p.planId !== planId) return p;
        const currentFeats = p.editFeatures || [];
        const nextFeats = currentFeats.includes(featureId)
          ? currentFeats.filter((f) => f !== featureId)
          : [...currentFeats, featureId];
        return { ...p, editFeatures: nextFeats };
      })
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
          isActive: Boolean(pkg.editIsActive),
          features: pkg.editFeatures || []
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

  const handleDeletePackage = async (pkg) => {
    const confirmMsg = `PERINGATAN: Apakah Anda yakin ingin menghapus paket "${pkg.name || pkg.editName}" (${pkg.planId})?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingPlanId(pkg.planId);
      setError("");
      setSuccessMsg("");

      const res = await axios.delete(
        `${serverUrl}/api/admin/packages/${pkg.planId}`,
        getHeaders()
      );

      if (res.data?.success) {
        setSuccessMsg(`Paket "${pkg.name || pkg.editName}" berhasil dihapus.`);
        setTimeout(() => setSuccessMsg(""), 4000);
        fetchData();
      }
    } catch (err) {
      console.error("Gagal menghapus paket:", err);
      setError(err.response?.data?.message || "Gagal menghapus paket.");
    } finally {
      setDeletingPlanId("");
    }
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    if (!newPkgForm.name.trim()) {
      alert("Nama paket wajib diisi!");
      return;
    }

    try {
      setCreatingPkg(true);
      setError("");
      setSuccessMsg("");

      const res = await axios.post(
        `${serverUrl}/api/admin/packages`,
        {
          name: newPkgForm.name.trim(),
          planId: newPkgForm.planId.trim() || undefined,
          amount: Number(newPkgForm.amount),
          quota: Number(newPkgForm.quota),
          durationDays: Number(newPkgForm.durationDays),
          isActive: Boolean(newPkgForm.isActive),
          features: newPkgForm.features
        },
        getHeaders()
      );

      if (res.data?.success) {
        setSuccessMsg(`Paket baru "${newPkgForm.name}" berhasil ditambahkan!`);
        setTimeout(() => setSuccessMsg(""), 4000);
        setIsAddModalOpen(false);
        setNewPkgForm({
          name: "",
          planId: "",
          amount: 50000,
          quota: 30,
          durationDays: 30,
          isActive: true,
          features: ["analisis", "bot"]
        });
        fetchData();
      }
    } catch (err) {
      console.error("Gagal membuat paket:", err);
      alert(err.response?.data?.message || "Gagal membuat paket baru.");
    } finally {
      setCreatingPkg(false);
    }
  };

  const handleToggleNewPkgFeature = (featureId) => {
    setNewPkgForm((prev) => {
      const current = prev.features || [];
      const updated = current.includes(featureId)
        ? current.filter((f) => f !== featureId)
        : [...current, featureId];
      return { ...prev, features: updated };
    });
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
          Kelola paket langganan, besaran harga, kuota, serta pilih fitur apa saja yang aktif saat pengguna berlangganan.
        </p>
      </div>

      {error && (
        <Wrapper style={{ background: "rgba(239, 68, 68, 0.08)" }}>
          <p style={{ color: "#ef4444", margin: 0 }}>{error}</p>
        </Wrapper>
      )}

      {successMsg && (
        <Wrapper style={{ background: "rgba(52, 179, 74, 0.08)" }}>
          <p style={{ color: "#34B34A", margin: 0, fontWeight: 600 }}>{successMsg}</p>
        </Wrapper>
      )}

      {/* METRIC OVERVIEW */}
      <div className={styles.metricGrid}>
        <Wrapper className={styles.metricCard} padding="20px">
          <span className={styles.metricLabel}>Total Pengguna</span>
          <h2 className={styles.metricValue}>{stats.totalUsers || 0}</h2>
          <span className={styles.metricSub}>Akun terdaftar</span>
        </Wrapper>
        <Wrapper className={styles.metricCard} padding="20px">
          <span className={styles.metricLabel}>Langganan Aktif</span>
          <h2 className={styles.metricValue}>{stats.activeSubscribers || 0}</h2>
          <span className={styles.metricSub}>Instansi aktif langganan</span>
        </Wrapper>
        <Wrapper className={styles.metricCard} padding="20px">
          <span className={styles.metricLabel}>Total Pendapatan</span>
          <h2 className={styles.metricValue}>{formatRupiah(stats.totalRevenue)}</h2>
          <span className={styles.metricSub}>Dari transaksi berhasil</span>
        </Wrapper>
        <Wrapper className={styles.metricCard} padding="20px">
          <span className={styles.metricLabel}>Status Paket</span>
          <h2 className={styles.metricValue}>
            {packages.filter((p) => p.isActive).length} Aktif
          </h2>
          <span className={styles.metricSub}>Dari {packages.length} tier paket</span>
        </Wrapper>
      </div>

      {/* KONFIGURASI PAKET (LANGSUNG INPUT & KELOLA FITUR) */}
      <Wrapper>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
              Konfigurasi Paket &amp; Harga
            </h2>
            <p className={styles.subText} style={{ margin: "4px 0 0 0" }}>
              Atur harga, kuota, dan centang fitur yang aktif ketika pengguna berlangganan paket terkait.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Tambah Paket Baru
          </Button>
        </div>

        {loading ? (
          <p style={{ color: "#888", marginTop: "16px" }}>Memuat daftar paket...</p>
        ) : (
          <div className={styles.packagesGrid} style={{ marginTop: "16px" }}>
            {packages.map((pkg) => {
              const isSaving = savingPlanId === pkg.planId;
              const isDeleting = deletingPlanId === pkg.planId;

              return (
                <Wrapper key={pkg._id || pkg.planId} className={styles.packageCard} padding="20px">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#34B34A", fontWeight: 700 }}>
                      {pkg.planId}
                    </span>
                    <span style={{ fontSize: "12px", color: "#888" }}>
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
                      <SearchableSelect
                        value={pkg.editIsActive ? "true" : "false"}
                        onChange={(val) =>
                          handlePackageFieldChange(
                            pkg.planId,
                            "editIsActive",
                            val === "true"
                          )
                        }
                        options={[
                          { value: "true", label: "Aktif" },
                          { value: "false", label: "Nonaktif" }
                        ]}
                      />
                    </div>
                  </div>

                  {/* CHECKLIST FITUR YANG ON SAAT BERLANGGANAN */}
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                      Fitur yang Aktif (ON) Saat Berlangganan:
                    </label>
                    <div className={styles.featuresChecklist}>
                      {AVAILABLE_FEATURES.map((feat) => {
                        const isChecked = (pkg.editFeatures || []).includes(feat.id);
                        return (
                          <Checkbox
                            key={feat.id}
                            checked={isChecked}
                            onChange={() => handleTogglePackageFeature(pkg.planId, feat.id)}
                            label={feat.label}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className={styles.cardActions}>
                    <div className={styles.saveBtnWrapper}>
                      <Button
                        fullWidth
                        variant="primary"
                        onClick={() => handleSavePackageDirect(pkg)}
                        disabled={isSaving || isDeleting}
                      >
                        {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                    </div>

                    <Button
                      variant="danger"
                      onClick={() => handleDeletePackage(pkg)}
                      disabled={isSaving || isDeleting}
                    >
                      {isDeleting ? "..." : "Hapus"}
                    </Button>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        )}
      </Wrapper>

      {/* MODAL TAMBAH PAKET BARU */}
      {isAddModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAddModalOpen(false)}>
          <Wrapper className={styles.modalBox} padding="24px" style={{ height: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Tambah Paket Langganan Baru</h3>

            <form onSubmit={handleCreatePackage} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Nama Paket *</label>
                <input
                  type="text"
                  placeholder="Contoh: Paket Komplit Statistik"
                  className={styles.cardInput}
                  value={newPkgForm.name}
                  onChange={(e) => setNewPkgForm({ ...newPkgForm, name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>ID Paket (Opsional, otomatis jika kosong)</label>
                <input
                  type="text"
                  placeholder="Contoh: paket_komplit_tahunan"
                  className={styles.cardInput}
                  value={newPkgForm.planId}
                  onChange={(e) => setNewPkgForm({ ...newPkgForm, planId: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Harga Paket (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    className={styles.cardInput}
                    value={newPkgForm.amount}
                    onChange={(e) => setNewPkgForm({ ...newPkgForm, amount: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Kuota (Dokumen/Pesan)</label>
                  <input
                    type="number"
                    min="1"
                    className={styles.cardInput}
                    value={newPkgForm.quota}
                    onChange={(e) => setNewPkgForm({ ...newPkgForm, quota: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Durasi (Hari)</label>
                  <input
                    type="number"
                    min="1"
                    className={styles.cardInput}
                    value={newPkgForm.durationDays}
                    onChange={(e) => setNewPkgForm({ ...newPkgForm, durationDays: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Status Layanan</label>
                  <SearchableSelect
                    value={newPkgForm.isActive ? "true" : "false"}
                    onChange={(val) => setNewPkgForm({ ...newPkgForm, isActive: val === "true" })}
                    options={[
                      { value: "true", label: "Aktif" },
                      { value: "false", label: "Nonaktif" }
                    ]}
                  />
                </div>
              </div>

              {/* CHECKLIST FITUR YANG ON KETIKA USER BERLANGGANAN */}
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  Pilih Fitur yang Aktif (ON) Saat Berlangganan:
                </label>
                <div className={styles.featuresChecklist}>
                  {AVAILABLE_FEATURES.map((feat) => {
                    const isChecked = newPkgForm.features.includes(feat.id);
                    return (
                      <Checkbox
                        key={feat.id}
                        checked={isChecked}
                        onChange={() => handleToggleNewPkgFeature(feat.id)}
                        label={feat.label}
                      />
                    );
                  })}
                </div>
              </div>

              <div className={styles.modalActions}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={creatingPkg}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={creatingPkg}
                >
                  {creatingPkg ? "Menyimpan..." : "Simpan Paket"}
                </Button>
              </div>
            </form>
          </Wrapper>
        </div>
      )}

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
                        style={{
                          fontWeight: 600,
                          fontSize: "12px",
                          color:
                            tx.status === "paid" || tx.status === "settlement" || tx.status === "capture"
                              ? "#34B34A"
                              : "#f59e0b"
                        }}
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
