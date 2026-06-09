import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import styles from "./SignUp.module.css";

// Components
import Logo from "../../components/Logo/Logo";
import Input from "../../components/Input/Input";
import MainButton from "../../components/MainButton/MainButton";

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
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

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
    <div className={styles.pageContainer}>
      <div className={styles.leftSection}>
        <div className={styles.brandContent}>
          <div className={styles.brandLogo}>
            <Logo />
          </div>
          <h2 className={styles.brandTitle}>Sintesa</h2>
          <p className={styles.brandDescription}>
            Sistem Intelijen Statistik dan Analitik terintegrasi untuk membantu pengambilan keputusan berbasis data yang cepat, akurat, dan andal.
          </p>
          
          {/* Area Konten Custom */}
          <div className={styles.customContentArea}>
            <div className={styles.illustrationCard}>
              <div className={styles.chartGlow}></div>
              <h3>Visualisasi Data Instan</h3>
              <p>Otomatisasi pengolahan dataset dan pembuatan ringkasan eksekutif berbasis kecerdasan artifisial.</p>
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
                        : (fetchingCities ? "Memuat kota..." : "-- Pilih Kota --")
                      }
                    </span>
                    <svg className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`} width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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
        </div>
      </div>
    </div>
  );
}
