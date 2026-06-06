import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./AISummary.module.css"

export default function AISummary({ onLoad }) {

  const [data, setData] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/aisummary`,
          {
            kota: "KOTA METRO"
          }
        )
        setData(res.data)
      } catch (err) {
        console.error(err.message)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <p>Ringkasan AI</p>
      <p>{data.summary}</p>
    </div>
  )
}