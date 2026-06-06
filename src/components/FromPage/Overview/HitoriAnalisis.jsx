import { useState, useEffect } from "react";
import style from "./AISummary"

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
    <div>
      <p>Histori Analisis</p>
      <table>
        <tr>
          <td>No</td>
          <td>Judul</td>
          <td>Tanggal Dibuat</td>
        </tr>
        {dummyHistory.map((item, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{item.title}</td>
            <td>{item.createdAt}</td>
          </tr>
        ))}
      </table>
    </div>
  )
}
