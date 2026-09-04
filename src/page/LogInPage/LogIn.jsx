import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { userStore } from "../../logic/state/store";
import styles from "./LogIn.module.css";

// Components
import Logo from "../../components/Logo/Logo";
import Input from "../../components/Input/Input";
import MainButton from "../../components/MainButton/MainButton";
import Beams from "../../components/Beams/Beams";

export default function LogIn() {
  const [step, setStep] = useState("credentials"); // "credentials" | "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpId, setOtpId] = useState("");
  const [devCode, setDevCode] = useState("");
  const [countdown, setCountdown] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();
  const login = userStore((state) => state.login);
  const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Step 1: Submit email & password, initiate OTP challenge
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post(`${serverUrl}/api/users/login/initiate`, {
        email,
        password,
      });

      const { otpId: newOtpId, devCode: newDevCode } = response.data;
      setOtpId(newOtpId);
      setDevCode(newDevCode || "");
      setStep("otp");
      setCountdown(60);
      setSuccess("Kode OTP 6-digit telah dikirimkan ke email Anda.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Gagal masuk. Silakan periksa kredensial atau koneksi Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and finalize login
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
      const response = await axios.post(`${serverUrl}/api/users/login/verify-otp`, {
        email,
        otpId,
        code: otpCode,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      login(user);

      navigate("/dashboard");
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
      const response = await axios.post(`${serverUrl}/api/users/login/resend-otp`, {
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

  const handleBackToCredentials = () => {
    setStep("credentials");
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
        <div className={styles.loginCardWrapper}>
          <div className={styles.content}>
            <div className={styles.mobileLogo}>
              <Logo />
            </div>

            {step === "credentials" ? (
              <>
                <div className={styles.header}>
                  <h1 className={styles.title}>Selamat Datang</h1>
                  <p className={styles.subtitle}>Masuk untuk mengakses dasbor Sistem Intelijen Statistik</p>
                </div>

                {error && <div className={styles.errorAlert}>{error}</div>}

                <form onSubmit={handleCredentialsSubmit} className={styles.form}>
                  <div className={styles.inputField}>
                    <label className={styles.label}>Email Instansi</label>
                    <Input
                      type="email"
                      placeholder="name@instansi.go.id"
                      value={email}
                      setValue={setEmail}
                    />
                  </div>

                  <div className={styles.inputField}>
                    <label className={styles.label}>Kata Sandi</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      setValue={setPassword}
                    />
                  </div>

                  <div className={styles.buttonWrapper}>
                    <MainButton onClick={handleCredentialsSubmit} disabled={loading}>
                      {loading ? "Memverifikasi..." : "Masuk"}
                    </MainButton>
                  </div>
                </form>

                <div className={styles.footer}>
                  <span>Belum memiliki akun?</span>{" "}
                  <Link to="/signup" className={styles.link}>
                    Daftar Wilayah Baru
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className={styles.header}>
                  <h1 className={styles.title}>Verifikasi OTP</h1>
                  <p className={styles.subtitle}>
                    Masukkan 6-digit kode verifikasi yang telah dikirimkan ke email Anda untuk menyelesaikan proses masuk.
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
                      onClick={handleBackToCredentials}
                      className={styles.backBtn}
                    >
                      ← Gunakan email lain
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
                      {loading ? "Memverifikasi..." : "Verifikasi & Masuk"}
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
