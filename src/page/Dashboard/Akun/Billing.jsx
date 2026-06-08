import { useState, useEffect } from "react";
import styles from "./Billing.module.css";

//component
import Wrapper from "../../../components/Wrapper/Wrapper";

export default function Billing() {

  return (
    <div className={styles.container}>
      <p className={styles.tabTitle}>Billing</p>
      <div className={styles.section}>
        <Wrapper>
          <div className={styles.content}>
            <p className={styles.sectionTitle}>Informasi Tagihan</p>
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
    </div>
  );
}