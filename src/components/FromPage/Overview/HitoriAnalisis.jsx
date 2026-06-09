import { useState, useEffect } from "react";
import styles from "./HitoriAnalisis.module.css";

export default function HitoriAnalisis({ onLoad }) {
  const [data, setData] = useState("")

  const dummyHistory = [
    {
      title: "Analisis Tren YoY Kota Metro April 2025",
      periode: "April 2026",
      createdAt: "16:00 25/2/2026"
    }
  ]

  return (
    <div className={styles.content}>
      <p className={styles.sectionTitle}>Histori Analisis</p>
      <div className={styles.tableResponsive}>
        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th>No</th>
              <th>Judul</th>
              <th>Tanggal Dibuat</th>
            </tr>
          </thead>
          <tbody>
            {dummyHistory.map((item, index) => (
              <tr key={index}>
                <td className={styles.noCol}>{index + 1}</td>
                <td>{item.title}</td>
                <td>{item.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
