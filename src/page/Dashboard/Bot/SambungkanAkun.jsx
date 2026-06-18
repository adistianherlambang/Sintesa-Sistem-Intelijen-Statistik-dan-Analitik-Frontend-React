import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./SambungkanAkun.module.css";
import Wrapper from "../../../components/Wrapper/Wrapper";
import MainButton from "../../../components/MainButton/MainButton";
import SearchableSelect from "../../../components/SearchableSelect/SearchableSelect";

export default function SambungkanAkun() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [botEnabled, setBotEnabled] = useState(true);
  const [activeTimeStart, setActiveTimeStart] = useState("00:00");
  const [activeTimeEnd, setActiveTimeEnd] = useState("23:59");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");
  const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";

  const fetchSession = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/users/bot/session`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSession(res.data);
      if (res.data) {
        setBotEnabled(res.data.botEnabled);
        setActiveTimeStart(res.data.activeTimeStart || "00:00");
        setActiveTimeEnd(res.data.activeTimeEnd || "23:59");
      }
    } catch (err) {
      console.error("Gagal memuat sesi WhatsApp:", err.message);
      setError("Gagal memuat data sesi bot.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  // Poll session status every 3 seconds when connecting/disconnected, or every 10 seconds when connected
  useEffect(() => {
    if (!token) return;

    const intervalTime = session?.status === "connected" ? 10000 : 3000;
    const interval = setInterval(() => {
      fetchSession();
    }, intervalTime);

    return () => clearInterval(interval);
  }, [token, serverUrl, session?.status]);

  const handleConnect = async () => {
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${serverUrl}/api/users/bot/session/connect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Menghubungkan WhatsApp. Silakan tunggu QR Code muncul...");
      await fetchSession();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menghubungkan WhatsApp.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Apakah Anda yakin ingin memutuskan koneksi WhatsApp?")) return;
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${serverUrl}/api/users/bot/session/disconnect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Koneksi WhatsApp berhasil diputuskan.");
      await fetchSession();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memutuskan koneksi WhatsApp.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestart = async () => {
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${serverUrl}/api/users/bot/session/restart`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Sesi WhatsApp dimulai ulang...");
      await fetchSession();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal me-restart sesi WhatsApp.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.put(`${serverUrl}/api/users/bot/session/config`, {
        botEnabled,
        activeTimeStart,
        activeTimeEnd
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Konfigurasi jam aktif bot berhasil disimpan.");
      setSession(res.data.session);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan konfigurasi.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) + " " + date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.tabTitle}>Sambungkan Akun WhatsApp</p>
        <p className={styles.loadingText}>Memuat status WhatsApp Bot...</p>
      </div>
    );
  }

  const isConnected = session && session.status === "connected";
  const isConnecting = session && session.status === "connecting";

  return (
    <div className={styles.container}>
      <p className={styles.tabTitle}>Sambungkan Akun WhatsApp</p>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {success && <div className={styles.successAlert}>{success}</div>}

      {!isConnected ? (
        // DISCONNECTED OR CONNECTING (SHOW QR CODE AND SCANNING INSTRUCTIONS)
        <div className={styles.section}>
          <Wrapper>
            <div className={styles.connectFlex}>
              <div className={styles.instructions}>
                <p className={styles.sectionTitle}>Hubungkan WhatsApp</p>
                <p className={styles.description}>
                  Silakan pindai kode QR berikut menggunakan aplikasi WhatsApp di ponsel Anda untuk mengaktifkan asisten bot otomatis.
                </p>
                <ol className={styles.stepList}>
                  <li>Buka aplikasi WhatsApp di ponsel Anda.</li>
                  <li>Buka menu setelan / opsi (titik tiga di kanan atas) dan klik <strong>Perangkat Tertaut</strong>.</li>
                  <li>Klik tombol <strong>Tautkan Perangkat</strong> lalu pindai QR Code di samping.</li>
                </ol>
                <div className={styles.btnWrapper}>
                  {!isConnecting && !session?.qrCode ? (
                    <MainButton onClick={handleConnect} disabled={actionLoading}>
                      {actionLoading ? "Memulai..." : "Mulai Sesi Koneksi"}
                    </MainButton>
                  ) : (
                    <MainButton onClick={handleRestart} disabled={actionLoading}>
                      {actionLoading ? "Memuat ulang..." : "Refresh QR Code"}
                    </MainButton>
                  )}
                </div>
              </div>
              <div className={styles.qrContainer}>
                {session?.qrCode ? (
                  <div className={styles.qrCodeWrapper}>
                    <img src={session.qrCode} alt="WhatsApp Connection QR Code" className={styles.qrImage} />
                    <p className={styles.qrLabel}>Pindai kode QR di atas</p>
                  </div>
                ) : isConnecting ? (
                  <div className={styles.qrLoading}>
                    <div className={styles.spinner}></div>
                    <p>Menghasilkan QR Code...</p>
                    <small>Proses ini memakan waktu beberapa detik</small>
                  </div>
                ) : (
                  <div className={styles.qrPlaceholder}>
                    <p>WhatsApp Belum Terhubung</p>
                    <small>Klik tombol di samping untuk menampilkan QR Code</small>
                  </div>
                )}
              </div>
            </div>
          </Wrapper>
        </div>
      ) : (
        // CONNECTED (SHOW DETAILS, STATS, BOT CONFIG & OPERATIONS)
        <div className={styles.connectedGrid}>
          {/* Status Koneksi */}
          <div className={styles.gridLeft}>
            <Wrapper>
              <div className={styles.content}>
                <p className={styles.sectionTitle}>Status Koneksi WhatsApp</p>
                <div className={styles.statusCard}>
                  <div className={styles.statusRow}>
                    <span className={styles.statusLabel}>Status:</span>
                    <span className={styles.activeBadge}>Terhubung</span>
                  </div>
                  <div className={styles.statusRow}>
                    <span className={styles.statusLabel}>Nomor WhatsApp:</span>
                    <strong>+{session.phoneNumber}</strong>
                  </div>
                  <div className={styles.statusRow}>
                    <span className={styles.statusLabel}>Session ID:</span>
                    <strong className={styles.codeText}>{session.userId}</strong>
                  </div>
                  <div className={styles.statusRow}>
                    <span className={styles.statusLabel}>Sinkronisasi Terakhir:</span>
                    <strong>{formatDateTime(session.lastSync)}</strong>
                  </div>
                </div>
                <div className={styles.dangerRow}>
                  <button className={styles.restartBtn} onClick={handleRestart} disabled={actionLoading}>
                    Restart Sesi
                  </button>
                  <button className={styles.disconnectBtn} onClick={handleDisconnect} disabled={actionLoading}>
                    Putuskan Koneksi
                  </button>
                </div>
              </div>
            </Wrapper>

            {/* Statistik Bot */}
            <div className={styles.statsSpace}>
              <Wrapper>
                <div className={styles.content}>
                  <p className={styles.sectionTitle}>Statistik Bot Hari Ini</p>
                  <div className={styles.statsCardGrid}>
                    <div className={styles.statBox}>
                      <span>Pesan Masuk</span>
                      <h2>{session.incomingCountToday}</h2>
                    </div>
                    <div className={styles.statBox}>
                      <span>Dibalas Bot</span>
                      <h2>{session.repliedCountToday}</h2>
                    </div>
                  </div>
                  <div className={styles.usageLimiter}>
                    <span>Total pesan terkirim siklus ini:</span>
                    <strong>{session.totalMessageCount} pesan</strong>
                  </div>
                </div>
              </Wrapper>
            </div>
          </div>

          {/* Kontrol Bot */}
          <div className={styles.gridRight}>
            <Wrapper>
              <div className={styles.content}>
                <p className={styles.sectionTitle}>Kontrol Operasional Bot</p>
                <p className={styles.description}>Atur jam aktif bot dan nyalakan/matikan bot asisten secara instan.</p>

                <div className={styles.controlForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Status Aktif Bot</label>
                    <div className={styles.selectWrapper}>
                      <SearchableSelect
                        value={botEnabled ? "on" : "off"}
                        onChange={(val) => setBotEnabled(val === "on")}
                        options={[
                          { value: "on", label: "AKTIF (ON)" },
                          { value: "off", label: "NONAKTIF (OFF)" }
                        ]}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Jam Operasional Bot</label>
                    <p className={styles.subtext}>* Bot asisten hanya akan membalas pesan dalam rentang jam aktif ini.</p>
                    <div className={styles.timeInputs}>
                      <div className={styles.timeField}>
                        <span>Mulai</span>
                        <input
                          type="time"
                          className={styles.timeInput}
                          value={activeTimeStart}
                          onChange={(e) => setActiveTimeStart(e.target.value)}
                        />
                      </div>
                      <div className={styles.timeField}>
                        <span>Selesai</span>
                        <input
                          type="time"
                          className={styles.timeInput}
                          value={activeTimeEnd}
                          onChange={(e) => setActiveTimeEnd(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.saveBtnRow}>
                    <MainButton onClick={handleSaveConfig} disabled={actionLoading}>
                      {actionLoading ? "Menyimpan..." : "Simpan Pengaturan"}
                    </MainButton>
                  </div>
                </div>
              </div>
            </Wrapper>
          </div>
        </div>
      )}
    </div>
  );
}