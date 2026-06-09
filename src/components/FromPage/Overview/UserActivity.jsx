import { useEffect, useState } from "react";
import styles from "./UserActivity.module.css"

export default function UserActivity({ onLoad }) {

  const activity = [
    {
      createdAt: "25/2/26",
      title: "Mengimpor dataset inflasi kota metro 2020-2025",
    },
    {
      createdAt: "25/2/26",
      title: "Mengimpor dataset inflasi kota metro 2020-2025",
    },
    {
      createdAt: "25/2/26",
      title: "Mengimpor dataset inflasi kota metro 2020-2025",
    },
    {
      createdAt: "25/2/26",
      title: "Mengimpor dataset inflasi kota metro 2020-2025",
    },
    {
      createdAt: "25/2/26",
      title: "Mengimpor dataset inflasi kota metro 2020-2025",
    },
  ]

  return (
    <div className={styles.content}>
      <p className={styles.sectionTitle}>Aktivitas</p>
      <div className={styles.tableResponsive}>
        <table className={styles.activityTable}>
          <tbody>
            {activity.map((item, index) => (
              <tr key={index}>
                <td className={styles.dateCol}>{item.createdAt}</td>
                <td>{item.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}