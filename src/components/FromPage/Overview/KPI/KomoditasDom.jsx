import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import styles from "./kpi.module.css"
import { userStore } from "../../../../logic/state/store"

export default function KomoditasDom({ onLoad }) {

  const [data, setData] = useState()
  const [load, setLoad] = useState(true)
  const user = userStore((state) => state.user)

  useEffect(() => {
    const getData = async () => {
      try {
        const userCity = user?.location?.name || "KOTA METRO"
        const res = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/komoditas`,
          {
            kota: userCity
          }
        )

        setData(res.data)


      } catch (err) {
        console.log(err.message)
      } finally {
        onLoad()
        setLoad(true)
      }
    }

    getData()
  }, [])

  const biggest = data?.biggest?.value
  const name = data?.biggest?.label

  return (
    <div className={styles.container}>
      <p className={styles.title}>Komoditas Dominan</p>
      <h1 className={styles.value}>{biggest}%</h1>
      <div className={styles.label}>{name}</div>
    </div>
  )
}
