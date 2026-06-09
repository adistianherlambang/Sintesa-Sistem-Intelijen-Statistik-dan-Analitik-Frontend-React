import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Billing.module.css";

// Components
import Wrapper from "../../../components/Wrapper/Wrapper";
import MainButton from "../../../components/MainButton/MainButton";

export default function Billing() {
  const [subStatus, setSubStatus] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loadingSub, setLoadingSub] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Payment States
  const [activePayment, setActivePayment] = useState(null); // stores invoice/QRIS info
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const plans = [
    {
      id: "wa_only_monthly",
      name: "Bot WhatsApp Only",
      period: "Bulanan",
      price: 50000,
      features: [
        "Akses Bot WhatsApp Utama",
        "Unggah berkas database ke Bot",
        "Satu perangkat WhatsApp saja",
        "Limit pesan: 1000 pesan masuk/keluar",
      ],
    },
    {
      id: "wa_only_yearly",
      name: "Bot WhatsApp Only",
      period: "Tahunan",
      price: 500000,
      badge: "Hemat 2 Bulan",
      features: [
        "Akses Bot WhatsApp Utama",
        "Unggah berkas database ke Bot",
        "Satu perangkat WhatsApp saja",
        "Limit pesan: 1000 pesan masuk/keluar",
        "Prioritas respon Bot",
      ],
    },
    {
      id: "wa_analisis_monthly",
      name: "Bot WA + Analisis",
      period: "Bulanan",
      price: 60000,
      features: [
        "Semua fitur Bot WhatsApp",
        "Modul Analisis Interaktif (IHK/YoY)",
        "Visualisasi D3 Hierarchy Komoditas",
        "Limit pesan: 1500 pesan masuk/keluar",
        "Kuota analisis: 50 berkas/bln",
      ],
    },
    {
      id: "wa_analisis_yearly",
      name: "Bot WA + Analisis",
      period: "Tahunan",
      price: 600000,
      badge: "Hemat 2 Bulan",
      features: [
        "Semua fitur Bot WhatsApp",
        "Modul Analisis Interaktif (IHK/YoY)",
        "Visualisasi D3 Hierarchy Komoditas",
        "Limit pesan: 1500 pesan masuk/keluar",
        "Kuota analisis: 600 berkas/thn",
        "Prioritas respon Bot & Laporan",
      ],
    },
  ];

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";
      const response = await axios.get(`${serverUrl}/api/users/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubStatus(response.data);
    } catch (err) {
      console.error("Gagal memuat status langganan:", err.message);
    } finally {
      setLoadingSub(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";
      const response = await axios.get(`${serverUrl}/api/users/billing`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBillingHistory(response.data || []);
    } catch (err) {
      console.error("Gagal memuat riwayat transaksi:", err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
    fetchHistory();
  }, []);

  const handleInitiatePayment = async (planId) => {
    setPaymentError("");
    setPaymentMessage("");
    try {
      const token = localStorage.getItem("token");
      const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";
      const response = await axios.post(
        `${serverUrl}/api/users/billing/pay`,
        { planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActivePayment(response.data.payment);
    } catch (err) {
      setPaymentError(
        err.response?.data?.message || "Gagal menginisiasi pembayaran QRIS."
      );
    }
  };

  const handleCheckStatus = async () => {
    if (!activePayment) return;
    setCheckingPayment(true);
    setPaymentError("");
    setPaymentMessage("");

    try {
      const token = localStorage.getItem("token");
      const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";
      const response = await axios.get(
        `${serverUrl}/api/users/billing/check/${activePayment.invoiceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { transaction } = response.data;
      if (transaction.status === "paid") {
        setPaymentMessage("Pembayaran berhasil! Paket Anda telah diaktifkan.");
        setTimeout(() => {
          setActivePayment(null);
          fetchSubscription();
          fetchHistory();
        }, 2000);
      } else {
        setPaymentError("Pembayaran belum diterima. Silakan selesaikan scan QRIS.");
      }
    } catch (err) {
      setPaymentError("Gagal memverifikasi pembayaran. Silakan coba lagi.");
    } finally {
      setCheckingPayment(false);
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatPlanName = (id) => {
    const plan = plans.find(p => p.id === id);
    return plan ? `${plan.name} (${plan.period})` : id;
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

  return (
    <div className={styles.container}>
      <p className={styles.tabTitle}>Langganan & Billing</p>

      {/* 1. STATUS LANGGANAN SAAT INI */}
      <div className={styles.section}>
        <Wrapper>
          <div className={styles.content}>
            <p className={styles.sectionTitle}>Informasi Paket Aktif</p>
            {loadingSub ? (
              <p className={styles.loadingText}>Memuat status langganan...</p>
            ) : subStatus && subStatus.status === "active" ? (
              <div className={styles.activeSubCard}>
                <div className={styles.activeSubMain}>
                  <h3>{formatPlanName(subStatus.subscriptionId)}</h3>
                  <span className={styles.activeBadge}>Aktif</span>
                </div>
                <div className={styles.activeSubDetails}>
                  <div className={styles.detailItem}>
                    <span>Limit Pesan Bot WA:</span>
                    <strong>
                      {subStatus.subscriptionId?.startsWith("wa_only")
                        ? "1.000 Pesan"
                        : subStatus.subscriptionId?.startsWith("wa_analisis")
                        ? "1.500 Pesan"
                        : "-"}
                    </strong>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Sisa Kuota Analisis:</span>
                    <strong>{subStatus.quota} Laporan/Aksi</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Mulai Berlangganan:</span>
                    <strong>{formatDateTime(subStatus.startedAt)}</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Berlaku Hingga:</span>
                    <strong>{formatDateTime(subStatus.expiredAt)}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.noSubCard}>
                <p>Anda saat ini menggunakan <strong>Sistem Gratis (Bukan Premium)</strong>.</p>
                <p className={styles.noSubDesc}>Silakan pilih salah satu paket di bawah untuk mengaktifkan Bot WhatsApp dan fitur Analisis penuh.</p>
              </div>
            )}
          </div>
        </Wrapper>
      </div>

      {/* 2. QRIS PAYMENT AREA (IF ACTIVE INVOICE) */}
      {activePayment && (
        <div className={styles.section}>
          <Wrapper>
            <div className={styles.content}>
              <div className={styles.paymentContainer}>
                <div className={styles.paymentInfo}>
                  <p className={styles.sectionTitle}>Selesaikan Pembayaran Anda</p>
                  <p className={styles.invoiceMeta}>Invoice ID: <strong>{activePayment.invoiceId}</strong></p>
                  <div className={styles.priceMeta}>
                    <span>Total Nominal:</span>
                    <h2 className={styles.finalAmount}>{formatPrice(activePayment.finalAmount)}</h2>
                  </div>
                  <p className={styles.hintText}>* Silakan scan kode QRIS di samping menggunakan aplikasi e-wallet pilihan Anda (GoPay, OVO, Dana, LinkAja, atau m-Banking).</p>
                  
                  <div className={styles.actionBlock}>
                    {paymentError && <span className={styles.errorText}>{paymentError}</span>}
                    {paymentMessage && <span className={styles.successText}>{paymentMessage}</span>}
                    <div className={styles.btnRow}>
                      <MainButton onClick={handleCheckStatus}>
                        {checkingPayment ? "Memverifikasi..." : "Cek Status Pembayaran"}
                      </MainButton>
                      <button 
                        onClick={() => setActivePayment(null)}
                        className={styles.cancelBtn}
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
                <div className={styles.qrisWrapper}>
                  <img 
                    src={activePayment.qrisImageUrl} 
                    alt="Scan QRIS bayar.gg" 
                    className={styles.qrisImage}
                  />
                  <small className={styles.qrisLogoLabel}>bayar.gg QRIS Paspor</small>
                </div>
              </div>
            </div>
          </Wrapper>
        </div>
      )}

      {/* 3. DAFTAR PAKET TERSEDIA */}
      <div className={styles.section}>
        <Wrapper>
          <div className={styles.content}>
            <p className={styles.sectionTitle}>Pilih Paket Langganan Premium</p>
            <div className={styles.plansGrid}>
              {plans.map((plan) => (
                <div key={plan.id} className={styles.planCard}>
                  {plan.badge && <span className={styles.planBadge}>{plan.badge}</span>}
                  <div className={styles.planHeader}>
                    <h4>{plan.name}</h4>
                    <span className={styles.planPeriod}>{plan.period}</span>
                    <h3 className={styles.planPrice}>{formatPrice(plan.price)}</h3>
                  </div>
                  <ul className={styles.featuresList}>
                    {plan.features.map((feat, idx) => (
                      <li key={idx}>✓ {feat}</li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => handleInitiatePayment(plan.id)}
                    className={styles.buyBtn}
                  >
                    Beli Sekarang (QRIS)
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Wrapper>
      </div>

      {/* 4. RIWAYAT TRANSAKSI */}
      <div className={styles.section}>
        <Wrapper>
          <div className={styles.content}>
            <p className={styles.sectionTitle}>Riwayat Transaksi (Invoices)</p>
            {loadingHistory ? (
              <p className={styles.loadingText}>Memuat riwayat transaksi...</p>
            ) : billingHistory.length > 0 ? (
              <div className={styles.tableResponsive}>
                <table className={styles.invoiceTable}>
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Tanggal Transaksi</th>
                      <th>Paket</th>
                      <th>Nominal</th>
                      <th>Status Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.map((invoice) => (
                      <tr key={invoice.invoiceId}>
                        <td className={styles.invoiceIdCol}>{invoice.invoiceId}</td>
                        <td>{formatDateTime(invoice.createdAt)}</td>
                        <td>{formatPlanName(invoice.subscriptionId?.subscriptionId)}</td>
                        <td>{formatPrice(invoice.finalAmount || invoice.amount)}</td>
                        <td>
                          <span className={`${styles.statusLabel} ${
                            invoice.status === "paid" ? styles.statusPaid : styles.statusPending
                          }`}>
                            {invoice.status === "paid" ? "Sukses" : "Pending / Menunggu"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.noHistoryText}>Belum ada riwayat transaksi pembayaran.</p>
            )}
          </div>
        </Wrapper>
      </div>
    </div>
  );
}