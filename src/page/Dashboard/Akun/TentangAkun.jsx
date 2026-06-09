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
                <Input
                  type="text"
                  value={wilayah}
                  disabled
                />
              </div>
            </div>

            <div className={styles.profileMeta}>
              <p className={styles.joinedDate}>
                Tanggal bergabung: {formatJoinedDate(user?.createdAt)}
              </p>
              {profileError && <span className={styles.errorText}>{profileError}</span>}
              {profileMessage && <span className={styles.successText}>{profileMessage}</span>}

            </div>
            <div className={styles.saveBtnWrapper}>
              <MainButton onClick={handleSaveProfile}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.5 1.50001C0.5 1.23479 0.605358 0.980434 0.792896 0.792896C0.980434 0.605358 1.23479 0.5 1.50001 0.5H9.92709L12.5001 2.90236V11.5001C12.5001 11.7653 12.3948 12.0197 12.2072 12.2072C12.0197 12.3948 11.7653 12.5001 11.5001 12.5001H1.50001C1.23479 12.5001 0.980434 12.3948 0.792896 12.2072C0.605358 12.0197 0.5 11.7653 0.5 11.5001V1.50001Z" stroke="white" stroke-linejoin="round" />
                  <mask id="path-2-inside-1_1116_4046" fill="white">
                    <path d="M6.50273 0.5L6.50006 2.96169C6.50006 3.07503 6.35073 3.16669 6.16673 3.16669H3.50003C3.31603 3.16669 3.16669 3.07503 3.16669 2.96169V0.5" />
                  </mask>
                  <path d="M6.50006 2.96169L6.16673 2.96133V2.96169H6.50006ZM6.50273 0.5L6.16939 0.499639L6.16673 2.96133L6.50006 2.96169L6.8334 2.96205L6.83607 0.500361L6.50273 0.5ZM6.50006 2.96169H6.16673C6.16673 2.91359 6.18328 2.87579 6.19922 2.85262C6.21394 2.83122 6.22709 2.82318 6.22785 2.82271C6.22806 2.82258 6.20729 2.83336 6.16673 2.83336V3.16669V3.50003C6.31017 3.50003 6.45606 3.46498 6.57694 3.39068C6.69245 3.31968 6.8334 3.17741 6.8334 2.96169H6.50006ZM6.16673 3.16669V2.83336H3.50003V3.16669V3.50003H6.16673V3.16669ZM3.50003 3.16669V2.83336C3.45947 2.83336 3.43869 2.82258 3.43891 2.82271C3.43967 2.82318 3.45282 2.83122 3.46754 2.85262C3.48347 2.87579 3.50003 2.91359 3.50003 2.96169H3.16669H2.83336C2.83336 3.17741 2.97431 3.31968 3.08981 3.39068C3.2107 3.46498 3.35659 3.50003 3.50003 3.50003V3.16669ZM3.16669 2.96169H3.50003V0.5H3.16669H2.83336V2.96169H3.16669Z" fill="white" mask="url(#path-2-inside-1_1116_4046)" />
                  <path d="M6.50273 0.5L6.50006 2.96169C6.50006 3.07503 6.35073 3.16669 6.16673 3.16669H3.50003C3.31603 3.16669 3.16669 3.07503 3.16669 2.96169V0.5H6.50273Z" stroke="white" stroke-linejoin="round" />
                  <path d="M1.50001 0.5H9.92709M3.16669 7.16673H9.83343M3.16669 9.83343H6.50272" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                {savingProfile ? "Menyimpan..." : "Simpan Profil Instansi"}
              </MainButton>
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
                <Input
                  type="text"
                  value={picEmail}
                  disabled
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
              </div>
              <div className={styles.saveBtnWrapper}>
                <MainButton onClick={handleUpdatePassword}>
                  <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M3.55619 4.15625C3.55619 1.86074 5.41693 0 7.71244 0C10.0079 0 11.8687 1.86074 11.8687 4.15625C11.8687 6.45176 10.0079 8.3125 7.71244 8.3125C6.78877 8.31321 5.89116 8.00631 5.16127 7.44023L1.69408 10.9074C1.6517 10.9498 1.58197 10.9498 1.53959 10.9074L0.031582 9.38711C-0.0105273 9.34407 -0.0105273 9.27429 0.031582 9.23125L0.575723 8.68711C0.618762 8.645 0.688543 8.645 0.731582 8.68711L1.58334 9.53887L2.19721 8.925L1.34545 8.07324C1.30334 8.0302 1.30334 7.96042 1.34545 7.91738L1.88959 7.37324C1.93263 7.33113 2.00241 7.33113 2.04545 7.37324L2.89721 8.225L4.42982 6.70605C3.88295 6.00195 3.55619 5.11738 3.55619 4.15625ZM7.71244 7.27344C8.54506 7.27344 9.32846 6.94941 9.91635 6.36016C10.5056 5.77227 10.8296 4.98887 10.8296 4.15625C10.8296 3.32363 10.5056 2.54023 9.91635 1.95234C9.32846 1.36309 8.54506 1.03906 7.71244 1.03906C6.87982 1.03906 6.09643 1.36309 5.50853 1.95234C4.91928 2.54023 4.59525 3.32363 4.59525 4.15625C4.59525 4.98887 4.91928 5.77227 5.50853 6.36016C6.09643 6.94941 6.87982 7.27344 7.71244 7.27344Z" fill="white" />
                  </svg>
                  {updatingPassword ? "Memperbarui..." : "Perbarui Kata Sandi"}
                </MainButton>
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