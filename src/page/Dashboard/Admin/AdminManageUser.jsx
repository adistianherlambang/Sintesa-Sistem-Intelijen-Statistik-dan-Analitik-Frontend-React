import { useState, useEffect } from "react";
import axios from "axios";
import Wrapper from "../../../components/Wrapper/Wrapper";
import MainButton from "../../../components/MainButton/MainButton";
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

          <select
            className={styles.filterSelect}
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua Peran (All Roles)</option>
            <option value="admin">Admin</option>
            <option value="user">User Biasa</option>
          </select>
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
                        <MainButton
                          onClick={() => handleToggleRole(u)}
                          style={{
                            width: "auto",
                            padding: "6px 12px",
                            fontSize: "12px",
                            borderRadius: "6px",
                            background: u.role === "admin" ? "rgba(255, 255, 255, 0.08)" : "var(--primaryColor)",
                            color: "#fff",
                            boxShadow: "none"
                          }}
                        >
                          {u.role === "admin" ? "Jadikan User" : "Jadikan Admin"}
                        </MainButton>

                        <MainButton
                          onClick={() => handleOpenEditSub(u)}
                          style={{
                            width: "auto",
                            padding: "6px 12px",
                            fontSize: "12px",
                            borderRadius: "6px",
                            background: "rgba(255, 255, 255, 0.08)",
                            color: "#fff",
                            boxShadow: "none"
                          }}
                        >
                          Kelola Kuota
                        </MainButton>

                        <MainButton
                          onClick={() => handleDeleteUser(u)}
                          style={{
                            width: "auto",
                            padding: "6px 12px",
                            fontSize: "12px",
                            borderRadius: "6px",
                            background: "rgba(239, 68, 68, 0.15)",
                            color: "#ef4444",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            boxShadow: "none"
                          }}
                        >
                          Hapus
                        </MainButton>
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
            <MainButton
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              style={{
                width: "auto",
                padding: "6px 14px",
                fontSize: "12px",
                borderRadius: "4px",
                background: "rgba(255, 255, 255, 0.06)",
                boxShadow: "none"
              }}
            >
              Sebelumnya
            </MainButton>
            <MainButton
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              style={{
                width: "auto",
                padding: "6px 14px",
                fontSize: "12px",
                borderRadius: "4px",
                background: "rgba(255, 255, 255, 0.06)",
                boxShadow: "none"
              }}
            >
              Selanjutnya
            </MainButton>
          </div>
        </div>
      </Wrapper>

      {/* MODAL EDIT SUBSCRIPTION */}
      {selectedUser && (
        <div className={styles.modalOverlay} onClick={handleCloseEditSub}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              Kelola Kuota &amp; Langganan: {selectedUser.email}
            </h3>

            <form onSubmit={handleSaveSub} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tingkat Paket (Plan)</label>
                <select
                  className={styles.formInput}
                  value={subForm.plan}
                  onChange={(e) => setSubForm({ ...subForm, plan: e.target.value })}
                >
                  <option value="wa_only_monthly">Bot WhatsApp Only (Bulanan)</option>
                  <option value="wa_only_yearly">Bot WhatsApp Only (Tahunan)</option>
                  <option value="wa_analisis_monthly">Bot WhatsApp + Analisis (Bulanan)</option>
                  <option value="wa_analisis_yearly">Bot WhatsApp + Analisis (Tahunan)</option>
                  <option value="free">Free / Gratis</option>
                </select>
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
                <select
                  className={styles.formInput}
                  value={subForm.status}
                  onChange={(e) => setSubForm({ ...subForm, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <MainButton
                  type="button"
                  onClick={handleCloseEditSub}
                  disabled={savingSub}
                  style={{
                    width: "auto",
                    padding: "8px 16px",
                    fontSize: "13px",
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "none"
                  }}
                >
                  Batal
                </MainButton>
                <MainButton
                  type="submit"
                  disabled={savingSub}
                  style={{
                    width: "auto",
                    padding: "8px 20px",
                    fontSize: "13px"
                  }}
                >
                  {savingSub ? "Menyimpan..." : "Simpan Perubahan"}
                </MainButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
