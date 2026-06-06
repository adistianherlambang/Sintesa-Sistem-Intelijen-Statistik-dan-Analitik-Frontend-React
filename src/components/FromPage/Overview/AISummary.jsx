import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./AISummary.module.css"

export default function AISummary({ onLoad }) {

  const [data, setData] = useState("")

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const res = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/aisummary`,
  //         {
  //           kota: "KOTA METRO"
  //         }
  //       )
  //       setData(res)
  //     } catch (err) {
  //       console.error(err.message)
  //     }
  //   }

  //   fetchData()
  // }, [])

  const summarySementara = "Pada April 2026, Kota Metro mencatatkan IHK sebesar 110.41 dengan data inflasi YoY tidak tersedia, di mana pendorong utamanya adalah kelompok Penyediaan Makanan dan Minuman / Restoran sebesar 1.12%."

  return (
    <div>
      <p>Ringkasan AI</p>
      <p>{summarySementara}</p>
    </div>
  )
}