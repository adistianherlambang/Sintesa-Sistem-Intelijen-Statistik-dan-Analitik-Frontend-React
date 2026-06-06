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
    <div>
      <p>Aktivitas</p>
      <table>
        {activity.map((item) => (
          <tr>
            <td>{item.createdAt}</td>
            <td>{item.title}</td>
          </tr>
        ))}
      </table>
    </div>
  )
}