import { useState, useEffect } from "react";
import styles from "./TentangAkun.module.css"

//component
import Wrapper from "../../../components/Wrapper/Wrapper";
import Input from "../../../components/Input/Input";

export default function TentangAkun() {

  const tanggalBergabungDummy = "2026-06-09";
  const lastChangeDummy = "5/06/2026 18:00";

  function timeAgo(dateString) {
    const [datePart, timePart] = dateString.split(" ");

    const [dd, mm, yyyy] = datePart.split("/");
    const [hh, min] = timePart.split(":");

    const target = new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(hh),
      Number(min)
    );

    const diffMs = Date.now() - target.getTime();

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (days > 0) return `${days} hari lalu`;
    if (hours > 0) return `${hours} jam lalu`;
    if (minutes > 0) return `${minutes} menit lalu`;

    return "baru saja";
  }

  const sessionDummy = [
    {
      browser: "Chrome",
      adress: "162.198.0.1",
      device: "Android (Samsung S25)",
      lastLogin: "16:00 25/2/2026"
    },
    {
      browser: "Safari",
      adress: "103.45.78.21",
      device: "iPhone 16 Pro",
      lastLogin: "09:15 26/2/2026"
    },
    {
      browser: "Firefox",
      adress: "192.168.10.45",
      device: "Windows 11 (ASUS Vivobook)",
      lastLogin: "13:42 26/2/2026"
    },
    {
      browser: "Edge",
      adress: "172.16.5.88",
      device: "Windows 11 (Dell XPS 15)",
      lastLogin: "20:30 26/2/2026"
    },
    {
      browser: "Chrome",
      adress: "10.0.0.125",
      device: "MacBook Air M4",
      lastLogin: "07:55 27/2/2026"
    }
  ];

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
                <Input type={"text"} />
              </div>
              <div className={styles.inputWrapper}>
                <p>Jenis Instansi</p>
                <Input type={"text"} />
              </div>
              <div className={styles.inputWrapper}>
                <p>Wilayah</p>
                <Input type={"text"} />
              </div>
            </div>
            <p style={{
              color: "#AAAAAA",
              fontSize: "12px"
            }}>Tanggal bergabung: {tanggalBergabungDummy}</p>
          </div>
        </Wrapper>
      </div>
      <div className={styles.section}>
        <Wrapper>
          <div className={styles.content}>
            <p className={styles.sectionTitle}>Informasi PIC</p>
            <div className={styles.inputContainer}>
              <div className={styles.inputWrapper}>
                <p>Nama PIC</p>
                <Input type={"text"} />
              </div>
              <div className={styles.inputWrapper}>
                <p>Email</p>
                <Input type={"text"} />
              </div>
              <div className={styles.inputWrapper}>
                <p>Kontak Utama</p>
                <Input type={"text"} />
              </div>
            </div>
            <p style={{
              color: "#AAAAAA",
              fontSize: "12px"
            }}>Tanggal bergabung: {tanggalBergabungDummy}</p>
          </div>
        </Wrapper>
      </div>
      <div className={styles.section}>
        <Wrapper>
          <div className={styles.content}>
            <p className={styles.sectionTitle}>Keamanan Akun</p>
            <div>
              <p>Kelola dan perbarui kata sandi untuk menjaga keamanan akun Anda</p>
              <p>Password terakhir diubah: {timeAgo(lastChangeDummy)}</p>
            </div>
          </div>
        </Wrapper>
        <Wrapper>
          <div className={styles.content}>
            <p className={styles.sectionTitle}>Kelola Session</p>
            <table>
              <tr>
                <td>No</td>
                <td>Browser</td>
                <td>Address</td>
                <td>Device</td>
                <td>Last Login</td>
                <td>Action</td>
              </tr>
              {sessionDummy.map((item, index) => (
                <tr>
                  <td>{index + 1}</td>
                  <td>{item.browser}</td>
                  <td>{item.adress}</td>
                  <td>{item.device}</td>
                  <td>{item.lastLogin}</td>
                  <td><button>Logout</button></td>
                </tr>
              ))}
            </table>
          </div>
        </Wrapper>
      </div>
    </div>
  )
}