import { useState, useEffect } from "react";
import styles from "./Input.module.css"

export default function Input({ value, setValue, type, placeholder }) {
  return (
    <input className={styles.input} type={type} value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} />
  )
}