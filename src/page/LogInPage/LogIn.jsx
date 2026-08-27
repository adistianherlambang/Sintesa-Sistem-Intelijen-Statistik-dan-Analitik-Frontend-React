import React, { useState } from "react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const login = userStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";
      const response = await axios.post(`${serverUrl}/api/users/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      // Save token and user details to localStorage/store
      localStorage.setItem("token", token);
      login(user);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Gagal masuk. Silakan periksa koneksi Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.leftContainer}>
        <div className={styles.leftSectionCard}>
          <div className={styles.beamsWrapper}>
            <div style={{ width: '1080px', height: '1080px', position: 'relative' }}>
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

            <div className={styles.header}>
              <h1 className={styles.title}>Selamat Datang</h1>
              <p className={styles.subtitle}>Masuk untuk mengakses dasbor Sistem Intelijen Statistik</p>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
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
                <MainButton onClick={handleSubmit}>
                  {loading ? "Memproses..." : "Masuk"}
                </MainButton>
              </div>
            </form>

            <div className={styles.footer}>
              <span>Belum memiliki akun?</span>{" "}
              <Link to="/signup" className={styles.link}>
                Daftar Wilayah Baru
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
