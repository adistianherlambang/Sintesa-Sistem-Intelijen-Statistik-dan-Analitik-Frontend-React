import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import styles from "./SignUp.module.css";

// Components
import Logo from "../../components/Logo/Logo";
import Input from "../../components/Input/Input";
import MainButton from "../../components/MainButton/MainButton";
import Beams from "../../components/Beams/Beams";

export default function SignUp() {
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState([]);

  const [otpCode, setOtpCode] = useState("");
  const [otpId, setOtpId] = useState("");
  const [devCode, setDevCode] = useState("");
  const [countdown, setCountdown] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [fetchingCities, setFetchingCities] = useState(true);

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/kota`);
        setCities(response.data || []);
      } catch (err) {
        console.error("Gagal mengambil data kota:", err.message);
        setError("Gagal memuat daftar wilayah. Silakan segarkan halaman.");
      } finally {
        setFetchingCities(false);
      }
    };
    fetchCities();
  }, [serverUrl]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Step 1: Submit form and request registration OTP
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !selectedCity) {
      setError("Semua kolom wajib diisi");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post(`${serverUrl}/api/users/register/initiate`, {
        name,
        email,
        password,
        kota: selectedCity,
      });

      const { otpId: newOtpId, devCode: newDevCode } = response.data;
      setOtpId(newOtpId);
      setDevCode(newDevCode || "");
      setStep("otp");
      setCountdown(60);
      setSuccess("Kode OTP verifikasi pendaftaran telah dikirimkan ke email Anda.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Gagal memproses pendaftaran. Silakan periksa kembali data Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and finalize registration
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setError("Silakan masukkan 6 digit kode OTP yang diterima.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.post(`${serverUrl}/api/users/register/verify-otp`, {
        name,
        email,
        password,
        kota: selectedCity,
        otpId,
        code: otpCode,
      });

      setSuccess("Registrasi berhasil diverifikasi! Mengalihkan ke halaman masuk...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Verifikasi kode OTP gagal. Pastikan kode yang Anda masukkan benar."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP code
  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return;

    setError("");
    setSuccess("");
    setResending(true);

    try {
      const response = await axios.post(`${serverUrl}/api/users/register/resend-otp`, {
        email,
      });

      const { otpId: newOtpId, devCode: newDevCode } = response.data;
      setOtpId(newOtpId);
      if (newDevCode) setDevCode(newDevCode);
      setCountdown(60);
      setSuccess("Kode OTP baru telah berhasil dikirim ulang.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Gagal mengirim ulang kode OTP. Silakan tunggu beberapa saat."
      );
    } finally {
      setResending(false);
    }
  };

  const handleBackToForm = () => {
    setStep("form");
    setOtpCode("");
    setError("");
    setSuccess("");
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.leftContainer}>
        <div className={styles.leftSectionCard}>
          <div className={styles.beamsWrapper}>
            <div style={{ width: "1080px", height: "1080px", position: "relative" }}>
              <Beams
                beamWidth={2}
                beamHeight={15}
                beamNumber={12}
                lightColor="#34B34A"
                speed={2}
                noiseIntensity={1.75}
                scale={0.2}
                rotation={0}
              />
            </div>
          </div>

          <div className={styles.brandContent}>
            <div className={styles.brandLogo}>
              <Logo />
            </div>

            <div className={styles.brandDescriptionWrapper}>
              <p className={styles.brandDescription}>
                Sistem Intelijen Statistik dan Analitik terintegrasi untuk membantu pengambilan keputusan berbasis data yang cepat, akurat, dan andal.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.signUpCardWrapper}>
          <div className={styles.content}>
            <div className={styles.mobileLogo}>
              <Logo />
            </div>

            {step === "form" ? (
              <>
                <div className={styles.header}>
                  <h1 className={styles.title}>Daftar Wilayah Baru</h1>
                  <p className={styles.subtitle}>Mendaftarkan akun instansi Anda pada sistem intelijen</p>
                </div>

                {error && <div className={styles.errorAlert}>{error}</div>}
                {success && <div className={styles.successAlert}>{success}</div>}

                <form onSubmit={handleSubmitForm} className={styles.form}>
                  <div className={styles.inputField}>
                    <label className={styles.label}>Nama Instansi / Dinas</label>
                    <Input
                      type="text"
                      placeholder="BPS Kota Metro"
                      value={name}
                      setValue={setName}
                    />
                  </div>

                  <div className={styles.inputField}>
                    <label className={styles.label}>Email Admin</label>
                    <Input
                      type="email"
                      placeholder="admin@bps.go.id"
                      value={email}
                      setValue={setEmail}
                    />
                  </div>

                  <div className={styles.inputField}>
                    <label className={styles.label}>Kata Sandi</label>
                    <Input
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={password}
                      setValue={setPassword}
                    />
                  </div>

                  <div className={styles.inputField} ref={dropdownRef}>
                    <label className={styles.label}>Pilih Kota</label>
                    <div className={styles.customSelectContainer}>
                      <div
                        className={`${styles.selectBox} ${isOpen ? styles.selectBoxActive : ""} ${fetchingCities ? styles.selectBoxDisabled : ""}`}
                        onClick={() => !fetchingCities && setIsOpen(!isOpen)}
                      >
                        <span>
                          {selectedCity
                            ? selectedCity
                            : fetchingCities
                            ? "Memuat kota..."
                            : "-- Pilih Kota --"}
                        </span>
                        <svg className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`} width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>

                      {isOpen && (
                        <div className={styles.dropdownMenu}>
                          <div className={styles.searchWrapper}>
                            <input
                              type="text"
                              placeholder="Cari kota..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className={styles.searchInput}
                              autoFocus
                            />
                          </div>
                          <div className={styles.optionsList}>
                            {filteredCities.length > 0 ? (
                              filteredCities.map((city) => (
                                <div
                                  key={city.name}
                                  onClick={() => {
                                    if (!city.claimed) {
                                      setSelectedCity(city.name);
                                      setIsOpen(false);
                                      setSearchQuery("");
                                    }
                                  }}
                                  className={`${styles.optionItem} ${city.claimed ? styles.optionClaimed : ""} ${selectedCity === city.name ? styles.optionSelected : ""}`}
                                >
                                  <span>{city.name}</span>
                                  {city.claimed && <span className={styles.claimedBadge}>Sudah Terklaim</span>}
                                </div>
                              ))
                            ) : (
                              <div className={styles.noOptions}>Kota tidak ditemukan</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <small className={styles.hint}>
                      * 1 wilayah hanya dapat diklaim dan dikelola oleh 1 akun instansi.
                    </small>
                  </div>

                  <div className={styles.buttonWrapper}>
                    <MainButton onClick={handleSubmitForm} disabled={loading}>
                      {loading ? "Memproses..." : "Daftar Akun"}
                    </MainButton>
                  </div>
                </form>

                <div className={styles.footer}>
                  <span>Sudah memiliki akun?</span>{" "}
                  <Link to="/login" className={styles.link}>
                    Masuk Sekarang
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className={styles.header}>
                  <h1 className={styles.title}>Verifikasi Email Pendaftaran</h1>
                  <p className={styles.subtitle}>
                    Masukkan 6-digit kode verifikasi OTP yang telah dikirimkan ke email untuk menyelesaikan pendaftaran instansi Anda.
                  </p>
                </div>

                <div className={styles.emailBadge}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  <span>Kode dikirim ke: <strong className={styles.emailHighlight}>{email}</strong></span>
                </div>

                {devCode && (
                  <div className={styles.devAlert}>
                    <strong>Mode Pengujian:</strong> Kode OTP Anda adalah <strong>{devCode}</strong>
                  </div>
                )}

                {error && <div className={styles.errorAlert}>{error}</div>}
                {success && <div className={styles.successAlert}>{success}</div>}

                <form onSubmit={handleVerifyOtp} className={styles.form}>
                  <div className={styles.inputField}>
                    <label className={styles.label}>Kode Verifikasi (6 Digit)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="••••••"
                      value={otpCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setOtpCode(val);
                      }}
                      className={styles.otpInputField}
                      autoFocus
                    />
                  </div>

                  <div className={styles.otpMetaRow}>
                    <button
                      type="button"
                      onClick={handleBackToForm}
                      className={styles.backBtn}
                    >
                      ← Ubah Data Pendaftaran
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || resending}
                      className={styles.resendBtn}
                    >
                      {resending
                        ? "Mengirim..."
                        : countdown > 0
                        ? `Kirim ulang (${countdown}s)`
                        : "Kirim Ulang Kode OTP"}
                    </button>
                  </div>

                  <div className={styles.buttonWrapper}>
                    <MainButton onClick={handleVerifyOtp} disabled={loading || otpCode.length !== 6}>
                      {loading ? "Memverifikasi..." : "Verifikasi & Aktifkan Akun"}
                    </MainButton>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
