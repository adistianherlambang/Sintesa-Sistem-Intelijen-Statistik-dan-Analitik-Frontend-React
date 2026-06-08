import { useState, useEffect } from "react";
import styles from "./TentangAkun.module.css"

//component
import Wrapper from "../../../components/Wrapper/Wrapper";
import Input from "../../../components/Input/Input";

export default function TentangAkun() {
  return (
    <div className={styles.container}>
      <p className={styles.tabTitle}>Tentang Akun</p>
      <div className={styles.wrapper}>
        <div className={styles.section}>
          <Wrapper>
            <p className={styles.sectionTitle}>Informasi Instansi</p>
            <Input type={"text"} />
          </Wrapper>
        </div>
      </div>
    </div>
  )
}