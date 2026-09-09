import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { userStore } from "../../logic/state/store";
import styles from "./SignUp.module.css";

// Components
import Logo from "../../components/Logo/Logo";
import Input from "../../components/Input/Input";
import MainButton from "../../components/MainButton/MainButton";
import Beams from "../../components/Beams/Beams";

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
  const login = userStore((state) => state.login);
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

  const isValidEmail = (val) => {
    if (!val || typeof val !== "string") return false;
    const trimmed = val.trim();
    if (trimmed.length > 254) return false;
    const emailRegex =
      /^[a-zA-Z0-9_%+-]+(\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    return emailRegex.test(trimmed);
  };

  // Submit form directly without OTP
  const handleSubmitForm = async (e) => {
    if (e) e.preventDefault();
    if (!name || !email || !password || !selectedCity) {
      setError("Semua kolom wajib diisi");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Format email tidak valid. Harap gunakan format email yang benar (contoh: nama@domain.com)");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post(`${serverUrl}/api/users/register`, {
        name: name.trim(),
        email: email.trim(),
        password,
        kota: selectedCity,
      });

      const { token, user } = response.data;
      if (token && user) {
        setSuccess("Pendaftaran berhasil! Mengalihkan ke dashboard...");
        localStorage.setItem("token", token);
        login(user);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        setSuccess("Pendaftaran berhasil! Mengalihkan ke halaman login...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Gagal memproses pendaftaran. Silakan periksa kembali data Anda."
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
                              {city.claimed && (
                                <span style={{ fontSize: "11px", color: "#888", fontWeight: 500 }}>
                                  (Sudah Terklaim)
                                </span>
                              )}
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
                <MainButton
                  onClick={handleSubmitForm}
                  disabled={loading}
                >
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
