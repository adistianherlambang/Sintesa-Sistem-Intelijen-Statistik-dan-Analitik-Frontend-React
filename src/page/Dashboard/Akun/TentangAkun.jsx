import { useState, useEffect } from "react";
import axios from "axios";
import { userStore } from "../../../logic/state/store";
import styles from "./TentangAkun.module.css";

// Components
import Wrapper from "../../../components/Wrapper/Wrapper";
import Input from "../../../components/Input/Input";
import MainButton from "../../../components/MainButton/MainButton";

export default function TentangAkun() {
  const user = userStore((state) => state.user);
  const login = userStore((state) => state.login);
  const logout = userStore((state) => state.logout);

  // Instansi States
  const [instansiName, setInstansiName] = useState(user?.profile?.name || "");
  const [instansiType, setInstansiType] = useState(user?.profile?.instansiType || "");
  const [wilayah] = useState(user?.location?.name || "");

  // PIC States
  const [picName, setPicName] = useState(user?.profile?.picName || "");
  const [picEmail] = useState(user?.email || "");
  const [picPhone, setPicPhone] = useState(user?.profile?.picPhone || "");

  // Password States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Alert/Status States
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Parse User Agent details for session view
  const [userAgentInfo, setUserAgentInfo] = useState({
    browser: "Chrome",
    device: "Desktop PC",
    address: "127.0.0.1",
  });

  useEffect(() => {
    // Basic UserAgent parsing
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    let device = "Desktop PC";

    if (ua.includes("Firefox")) browser = "Mozilla Firefox";
    else if (ua.includes("SamsungBrowser")) browser = "Samsung Browser";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
    else if (ua.includes("Edge")) browser = "Microsoft Edge";
    else if (ua.includes("Chrome")) browser = "Google Chrome";
    else if (ua.includes("Safari")) browser = "Apple Safari";

    if (/Mobi|Android|iPhone/i.test(ua)) {
      device = ua.includes("iPhone") ? "iPhone" : "Android Device";
    } else if (/Macintosh/i.test(ua)) {
      device = "macOS Device";
    } else if (/Windows/i.test(ua)) {
      device = "Windows PC";
    }

    setUserAgentInfo({
      browser,
      device,
      address: "127.0.0.1", // Standard local host representation
    });
  }, []);

  const handleSaveProfile = async () => {
    setProfileError("");
    setProfileMessage("");
    setSavingProfile(true);

    try {
      const token = localStorage.getItem("token");
      const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";
      const response = await axios.post(
        `${serverUrl}/api/users/profile`,
        {
          name: instansiName,
          instansiType,
          picName,
          picPhone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local Zustand store
      login(response.data.user);
      setProfileMessage("Profil instansi berhasil diperbarui.");
    } catch (err) {
      setProfileError(
        err.response?.data?.message || "Gagal menyimpan data profil."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError("");
    setPasswordMessage("");

    if (!oldPassword || !newPassword) {
      setPasswordError("Sandi lama dan sandi baru wajib diisi");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Sandi baru minimal harus 6 karakter");
      return;
    }

    setUpdatingPassword(true);

    try {
      const token = localStorage.getItem("token");
      const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";
      await axios.post(
        `${serverUrl}/api/users/profile/password`,
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPasswordMessage("Kata sandi berhasil diperbarui.");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Sandi lama salah atau gagal memperbarui sandi."
      );
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    logout();
  };

  const formatJoinedDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatLastLogin = (isoString) => {
    if (!isoString) return "Baru saja";
    const date = new Date(isoString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " " + date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className={styles.container}>
      <p className={styles.tabTitle}>Tentang Akun</p>
      
      <div className={styles.section}>
        <Wrapper>
          <div className={styles.content}>
            <p className={styles.sectionTitle}>Informasi Instansi</p>
            <div className={styles.inputContainer}>
              <div className={styles.inputWrapper}>
                <p>Nama Instansi</p>
                <Input 
                  type="text" 
                  value={instansiName} 
                  setValue={setInstansiName} 
                />
              </div>
              <div className={styles.inputWrapper}>
                <p>Jenis Instansi</p>
                <Input 
                  type="text" 
                  value={instansiType} 
                  setValue={setInstansiType} 
                  placeholder="Contoh: BPS Kota, Bappeda, dll"
                />
              </div>
              <div className={styles.inputWrapper}>
                <p>Wilayah Kerja (Klaim)</p>
                <input 
                  type="text" 
                  value={wilayah} 
                  disabled 
                  className={styles.disabledInput}
                />
              </div>
            </div>
            
            <div className={styles.profileMeta}>
              <p className={styles.joinedDate}>
                Tanggal bergabung: {formatJoinedDate(user?.createdAt)}
              </p>
              {profileError && <span className={styles.errorText}>{profileError}</span>}
              {profileMessage && <span className={styles.successText}>{profileMessage}</span>}
              <div className={styles.saveBtnWrapper}>
                <MainButton onClick={handleSaveProfile}>
                  {savingProfile ? "Menyimpan..." : "Simpan Profil Instansi"}
                </MainButton>
              </div>
            </div>
          </div>
        </Wrapper>
      </div>

      <div className={styles.section}>
        <Wrapper>
          <div className={styles.content}>
            <p className={styles.sectionTitle}>Informasi PIC (Penanggung Jawab)</p>
            <div className={styles.inputContainer}>
              <div className={styles.inputWrapper}>
                <p>Nama Lengkap PIC</p>
                <Input 
                  type="text" 
                  value={picName} 
                  setValue={setPicName} 
                />
              </div>
              <div className={styles.inputWrapper}>
                <p>Email Admin Wilayah</p>
                <input 
                  type="text" 
                  value={picEmail} 
                  disabled 
                  className={styles.disabledInput}
                />
              </div>
              <div className={styles.inputWrapper}>
                <p>Kontak WhatsApp PIC</p>
                <Input 
                  type="text" 
                  value={picPhone} 
                  setValue={setPicPhone} 
                  placeholder="Contoh: 0812xxxxxxxx"
                />
              </div>
            </div>
          </div>
        </Wrapper>
      </div>

      <div className={styles.section}>
        <Wrapper>
          <div className={styles.content}>
            <p className={styles.sectionTitle}>Keamanan Akun</p>
            <p className={styles.description}>
              Kelola dan perbarui kata sandi untuk menjaga keamanan akun instansi Anda.
            </p>
            <div className={styles.passwordForm}>
              <div className={styles.inputWrapper}>
                <p>Kata Sandi Lama</p>
                <Input 
                  type="password" 
                  value={oldPassword} 
                  setValue={setOldPassword} 
                  placeholder="••••••••"
                />
              </div>
              <div className={styles.inputWrapper}>
                <p>Kata Sandi Baru</p>
                <Input 
                  type="password" 
                  value={newPassword} 
                  setValue={setNewPassword} 
                  placeholder="Minimal 6 karakter"
                />
              </div>
              
              <div className={styles.passwordMeta}>
                {passwordError && <span className={styles.errorText}>{passwordError}</span>}
                {passwordMessage && <span className={styles.successText}>{passwordMessage}</span>}
                <div className={styles.saveBtnWrapper}>
                  <MainButton onClick={handleUpdatePassword}>
                    {updatingPassword ? "Memperbarui..." : "Perbarui Kata Sandi"}
                  </MainButton>
                </div>
              </div>
            </div>
          </div>
        </Wrapper>

        <Wrapper>
          <div className={styles.content}>
            <p className={styles.sectionTitle}>Kelola Sesi Aktif</p>
            <div className={styles.tableResponsive}>
              <table className={styles.sessionTable}>
                <thead>
                  <tr>
                    <th>Browser</th>
                    <th>Perangkat</th>
                    <th>IP Address</th>
                    <th>Login Terakhir</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.activeLabel}>
                      {userAgentInfo.browser} <span className={styles.badge}>Sesi Ini</span>
                    </td>
                    <td>{userAgentInfo.device}</td>
                    <td>{userAgentInfo.address}</td>
                    <td>{formatLastLogin(user?.lastLogin || user?.updatedAt)}</td>
                    <td>
                      <button 
                        onClick={handleLogout} 
                        className={styles.logoutBtn}
                      >
                        Logout
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Wrapper>
      </div>
    </div>
  );
}