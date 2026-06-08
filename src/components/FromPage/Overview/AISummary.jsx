import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./AISummary.module.css"
import { userStore } from "../../../logic/state/store"

export default function AISummary({ onLoad }) {

  const [data, setData] = useState("")
  const user = userStore((state) => state.user)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userCity = user?.location?.name || "KOTA METRO"
        const res = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/aisummary`,
          {
            kota: userCity
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