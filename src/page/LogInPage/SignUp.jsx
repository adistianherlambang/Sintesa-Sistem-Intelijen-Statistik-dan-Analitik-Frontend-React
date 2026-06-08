import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import styles from "./SignUp.module.css";

// Components
import Logo from "../../components/Logo/Logo";
import Input from "../../components/Input/Input";
import MainButton from "../../components/MainButton/MainButton";
import Wrapper from "../../components/Wrapper/Wrapper";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState([]);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingCities, setFetchingCities] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !selectedCity) {
      setError("Semua kolom wajib diisi");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";
      await axios.post(`${serverUrl}/api/users/register`, {
        name,
        email,
        password,
        kota: selectedCity,
      });

      setSuccess("Registrasi berhasil! Mengalihkan ke halaman masuk...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Gagal melakukan pendaftaran. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.cardContainer}>
        <Wrapper padding="2.5rem">
          <div className={styles.content}>
            <div className={styles.logoWrapper}>
              <Logo />
            </div>

            <div className={styles.header}>
              <h1 className={styles.title}>Daftar Wilayah Baru</h1>
              <p className={styles.subtitle}>Mendaftarkan akun instansi Anda pada sistem intelijen</p>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}
            {success && <div className={styles.successAlert}>{success}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
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

              <div className={styles.inputField}>
                <label className={styles.label}>Pilih Wilayah Tugas</label>
                <div className={styles.selectWrapper}>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className={styles.select}
                    disabled={fetchingCities}
                  >
                    <option value="">
                      {fetchingCities ? "Memuat wilayah..." : "-- Pilih Wilayah --"}
                    </option>
                    {cities.map((city) => (
                      <option
                        key={city.id}
                        value={city.id}
                        disabled={city.claimed}
                        className={city.claimed ? styles.claimedOption : ""}
                      >
                        {city.name} {city.claimed ? "(Sudah Terklaim)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <small className={styles.hint}>
                  * 1 wilayah hanya dapat diklaim dan dikelola oleh 1 akun instansi.
                </small>
              </div>

              <div className={styles.buttonWrapper}>
                <MainButton onClick={handleSubmit}>
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
          </div>
        </Wrapper>
      </div>
    </div>
  );
}
