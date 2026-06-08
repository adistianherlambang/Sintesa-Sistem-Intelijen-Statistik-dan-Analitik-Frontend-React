import { useState, useEffect } from "react";
import styles from "./TentangAkun.module.css"

//component
import Wrapper from "../../../components/Wrapper/Wrapper";
import Input from "../../../components/Input/Input";

export default function TentangAkun() {

  const tanggalBergabungDummy = "2026-06-09";

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
          </div>
        </Wrapper>
        <Wrapper>
          <div className={styles.content}>
            <p className={styles.sectionTitle}>Kelola Session</p>
          </div>
        </Wrapper>
      </div>
    </div>
  )
}