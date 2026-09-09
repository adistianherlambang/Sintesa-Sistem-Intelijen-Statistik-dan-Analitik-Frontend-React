import { useState, useEffect } from "react";
import axios from "axios";
import Wrapper from "../../../components/Wrapper/Wrapper";
import Button from "../../../components/Button/Button";
import SearchableSelect from "../../../components/SearchableSelect/SearchableSelect";
import styles from "./AdminManageUser.module.css";

export default function AdminManageUser() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Edit Subscription Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [subForm, setSubForm] = useState({
    plan: "wa_analisis_yearly",
    wordQuota: 30,
    pdfQuota: 30,
    status: "active"
  });
  const [savingSub, setSavingSub] = useState(false);

  const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        page,
        limit: 10,
        search: search.trim(),
        role: roleFilter
      };
      const res = await axios.get(`${serverUrl}/api/admin/users`, {
        ...getHeaders(),
        params
      });

      const payload = res.data?.data || res.data;
      if (payload) {
        setUsers(payload.users || res.data?.users || []);
        setTotal(payload.total ?? payload.pagination?.total ?? 0);
        setTotalPages(payload.totalPages ?? payload.pagination?.totalPages ?? 1);
      }
    } catch (err) {
      console.error("Gagal mengambil data pengguna:", err);
      setError(err.response?.data?.message || "Gagal mengambil daftar pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    const confirmMsg = `Apakah Anda yakin ingin mengubah peran pengguna "${user.email}" menjadi "${newRole.toUpperCase()}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setMessage("");
      setError("");
      const res = await axios.put(
        `${serverUrl}/api/admin/users/${user._id || user.userId}/role`,
        { role: newRole },
        getHeaders()
      );

      if (res.data?.success) {
        setMessage(`Peran ${user.email} berhasil diubah menjadi ${newRole}.`);
        fetchUsers();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Gagal mengubah role:", err);
      setError(err.response?.data?.message || "Gagal mengubah peran pengguna.");
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmMsg = `PERINGATAN: Apakah Anda yakin ingin menghapus akun "${user.email}"? Tindakan ini tidak dapat dibatalkan!`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setMessage("");
      setError("");
      const res = await axios.delete(`${serverUrl}/api/admin/users/${user._id || user.userId}`, getHeaders());
      if (res.data?.success) {
        setMessage(`Pengguna ${user.email} berhasil dihapus.`);
        fetchUsers();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Gagal menghapus user:", err);
      setError(err.response?.data?.message || "Gagal menghapus pengguna.");
    }
  };

  const handleOpenEditSub = (user) => {
    setSelectedUser(user);
    setSubForm({
      plan: user.subscription?.plan || "wa_analisis_yearly",
      wordQuota: user.subscription?.quota?.word ?? user.subscription?.quota ?? 30,
      pdfQuota: user.subscription?.quota?.pdf ?? user.subscription?.quota ?? 30,
      status: user.subscription?.status || "active"
    });
  };

  const handleCloseEditSub = () => {
    setSelectedUser(null);
  };

  const handleSaveSub = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setSavingSub(true);
      const res = await axios.put(
        `${serverUrl}/api/admin/users/${selectedUser._id || selectedUser.userId}/subscription`,
        {
          plan: subForm.plan,
          status: subForm.status,
          quota: {
            word: Number(subForm.wordQuota),
            pdf: Number(subForm.pdfQuota)
          }
        },
        getHeaders()
      );

      if (res.data?.success) {
        setMessage(`Langganan & kuota untuk ${selectedUser.email} berhasil diperbarui.`);
        handleCloseEditSub();
        fetchUsers();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Gagal update subscription:", err);
      alert(err.response?.data?.message || "Gagal memperbarui langganan pengguna.");
    } finally {
      setSavingSub(false);
    }
  };

  return (
    <div className={styles.container}>
      <div>
        <h1 className={styles.tabTitle}>Manajemen Pengguna</h1>
        <p className={styles.subText}>
          Kelola seluruh akun pengguna terdaftar, peran akses sistem (Admin/User), dan kuota langganan.
        </p>
      </div>

      {error && (
        <Wrapper style={{ borderColor: "#ef4444", background: "rgba(239, 68, 68, 0.08)" }}>
          <p style={{ color: "#ef4444", margin: 0 }}>{error}</p>
        </Wrapper>
      )}

      {message && (
        <Wrapper style={{ borderColor: "#34B34A", background: "rgba(52, 179, 74, 0.08)" }}>
          <p style={{ color: "#34B34A", margin: 0, fontWeight: 500 }}>{message}</p>
        </Wrapper>
      )}

      <Wrapper>
        {/* CONTROLS */}
        <div className={styles.controlsBar}>
          <form onSubmit={handleSearchSubmit} className={styles.searchBox}>
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#888"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Cari email, instansi, atau PIC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <div style={{ width: "220px" }}>
            <SearchableSelect
              value={roleFilter}
              onChange={(val) => {
                setRoleFilter(val);
                setPage(1);
              }}
              options={[
                { value: "", label: "Semua Peran (All Roles)" },
                { value: "admin", label: "Admin" },
                { value: "user", label: "User Biasa" }
              ]}
              placeholder="Filter peran..."
            />
          </div>
        </div>

        {/* TABLE */}
        <div className={styles.tableResponsive}>
          <table className={styles.customTable}>
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>Instansi &amp; Wilayah</th>
                <th>Peran</th>
                <th>Paket</th>
                <th>Sisa Kuota</th>
                <th>Terdaftar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "#888", padding: "28px" }}>
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u._id || u.userId}>
                    <td>
                      <div style={{ fontWeight: 600, color: "#fff" }}>
                        {u.profile?.picName || u.profile?.name || "Pengguna"}
                      </div>
                      <div style={{ fontSize: "11px", color: "#888" }}>{u.email}</div>
                    </td>
                    <td>
                      <div>{u.profile?.name || "-"}</div>
                      <div style={{ fontSize: "11px", color: "#888" }}>
                        {u.location?.name || "-"}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "12px",
                          color: u.role === "admin" ? "#ef4444" : "#34B34A",
                          textTransform: "uppercase"
                        }}
                      >
                        {u.role || "user"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#d5d5d5" }}>
                        {u.subscription?.plan || "free"}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "#34B34A", fontWeight: 600 }}>
                        {u.subscription?.quota?.word === -1
                          ? "∞"
                          : u.subscription?.quota?.word ?? u.subscription?.quota ?? 0}
                      </span>{" "}
                      Kuota
                    </td>
                    <td style={{ fontSize: "12px", color: "#888" }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td>
                      <div className={styles.actionsGroup}>
                        <Button
                          size="sm"
                          variant={u.role === "admin" ? "secondary" : "primary"}
                          onClick={() => handleToggleRole(u)}
                        >
                          {u.role === "admin" ? "Jadikan User" : "Jadikan Admin"}
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenEditSub(u)}
                        >
                          Kelola Kuota
                        </Button>

                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteUser(u)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "#888", padding: "28px" }}>
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className={styles.paginationBar}>
          <div>
            Total <strong>{total}</strong> pengguna (Halaman {page} dari {totalPages})
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Sebelumnya
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </Wrapper>

      {/* MODAL EDIT SUBSCRIPTION */}
      {selectedUser && (
        <div className={styles.modalOverlay} onClick={handleCloseEditSub}>
          <Wrapper className={styles.modalBox} padding="24px" style={{ height: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              Kelola Kuota &amp; Langganan: {selectedUser.email}
            </h3>

            <form onSubmit={handleSaveSub} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tingkat Paket (Plan)</label>
                <SearchableSelect
                  value={subForm.plan}
                  onChange={(val) => setSubForm({ ...subForm, plan: val })}
                  options={[
                    { value: "wa_only_monthly", label: "Bot WhatsApp Only (Bulanan)" },
                    { value: "wa_only_yearly", label: "Bot WhatsApp Only (Tahunan)" },
                    { value: "wa_analisis_monthly", label: "Bot WhatsApp + Analisis (Bulanan)" },
                    { value: "wa_analisis_yearly", label: "Bot WhatsApp + Analisis (Tahunan)" },
                    { value: "free", label: "Free / Gratis" }
                  ]}
                  placeholder="Pilih paket..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Sisa Kuota Word (-1 = ∞)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={subForm.wordQuota}
                    onChange={(e) => setSubForm({ ...subForm, wordQuota: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Sisa Kuota PDF (-1 = ∞)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={subForm.pdfQuota}
                    onChange={(e) => setSubForm({ ...subForm, pdfQuota: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status Langganan</label>
                <SearchableSelect
                  value={subForm.status}
                  onChange={(val) => setSubForm({ ...subForm, status: val })}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                    { value: "expired", label: "Expired" }
                  ]}
                  placeholder="Pilih status..."
                />
              </div>

              <div className={styles.modalActions}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseEditSub}
                  disabled={savingSub}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={savingSub}
                >
                  {savingSub ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </Wrapper>
        </div>
      )}
    </div>
  );
}
