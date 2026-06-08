import { useState, useEffect } from "react";
import styles from "./Billing.module.css";

//component
import Wrapper from "../../../components/Wrapper/Wrapper";
import Input from "../../../components/Input/Input";

export default function Billing() {

  return (
    <div className={styles.container}>
      <p className={styles.tabTitle}>Billing</p>
      <div className={styles.section}>
        <Wrapper>
          <div className={styles.content}>
            <p className={styles.sectionTitle}>Informasi Tagihan</p>
          </div>
        </Wrapper>
      </div>
    </div>
  );
}