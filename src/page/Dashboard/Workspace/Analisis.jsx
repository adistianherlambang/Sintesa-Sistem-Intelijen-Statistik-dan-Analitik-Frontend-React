import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import styles from "./Analisis.module.css"

// component
import Stepper from '../../../components/Stepper/Stepper'
import Wrapper from '../../../components/Wrapper/Wrapper'

export default function Analisis() {

  const [state, setState] = useState("")

  const item = [
    { label: "StepOne", content: StepOne },
    { label: "StepTwo", content: StepTwo },
    { label: "StepThree", content: StepThree },
  ]

  const req = []

  return (
    <div className={styles.container}>
      <p className={styles.tabTitle}>Analisis</p>
      <Stepper item={item} />
    </div>
  )
}

function StepOne(props) {

  const { setStep } = props

  const handleClick = (props) => {
    setStep(1)
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.section}>
          <Wrapper onClick={handleClick}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "2rem",
              height: "300px"
            }}>
              <div style={{
                borderRadius: "100px",
                width: 64,
                height: 64,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}>
                <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M10.9422 4.64516C10.7272 4.64519 10.5169 4.58004 10.3366 4.4576C10.1564 4.33516 10.0139 4.16069 9.92667 3.95536L9.12333 2.06245C9.07715 1.96613 9.00624 1.88513 8.91852 1.82853C8.83081 1.77192 8.72975 1.74194 8.62667 1.74194H2.22222C2.07488 1.74194 1.93357 1.80311 1.82939 1.912C1.7252 2.0209 1.66667 2.16858 1.66667 2.32258V15.6774C1.66667 15.8314 1.7252 15.9791 1.82939 16.088C1.93357 16.1969 2.07488 16.2581 2.22222 16.2581H17.7778C17.9251 16.2581 18.0664 16.1969 18.1706 16.088C18.2748 15.9791 18.3333 15.8314 18.3333 15.6774V5.22581C18.3333 5.07181 18.2748 4.92412 18.1706 4.81523C18.0664 4.70634 17.9251 4.64516 17.7778 4.64516H10.9422ZM11.6222 2.90323C11.5122 2.90311 11.4046 2.86883 11.3132 2.80474C11.2218 2.74065 11.1507 2.64963 11.1089 2.54323L10.6144 1.28439C10.4299 0.898298 10.146 0.573605 9.79467 0.346737C9.44336 0.119868 9.03852 -0.000200873 8.62556 2.5226e-07H2.22222C1.63285 2.5226e-07 1.06762 0.2447 0.650874 0.680268C0.234126 1.11584 0 1.70659 0 2.32258V15.6774C0 16.2934 0.234126 16.8842 0.650874 17.3197C1.06762 17.7553 1.63285 18 2.22222 18H17.7778C18.3671 18 18.9324 17.7553 19.3491 17.3197C19.7659 16.8842 20 16.2934 20 15.6774V5.22581C20 4.60982 19.7659 4.01906 19.3491 3.58349C18.9324 3.14793 18.3671 2.90323 17.7778 2.90323H11.6222Z" fill="white" />
                </svg>
              </div>
              <p style={{
                fontSize: 24,
                fontWeight: "bold"
              }}>Menggunakan Dataset yang Tersedia</p>
            </div>
          </Wrapper>
          <Wrapper onClick={handleClick}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "2rem",
              height: "300px"
            }}>
              <div style={{
                borderRadius: "100px",
                width: 64,
                height: 64,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 1V11.6667M4.55556 5.44444L9 1L13.4444 5.44444M17 11.6667V15.2222C17 15.6937 16.8127 16.1459 16.4793 16.4793C16.1459 16.8127 15.6937 17 15.2222 17H2.77778C2.30628 17 1.8541 16.8127 1.5207 16.4793C1.1873 16.1459 1 15.6937 1 15.2222V11.6667" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <p style={{
                fontSize: 24,
                fontWeight: "bold"
              }}>Unggah Dataset Secara Manual</p>
            </div>
          </Wrapper>
        </div>
      </div>
    </div>
  )
}

function StepTwo(props) {

  const { setStep } = props

  const [inflasi, setInflasi] = useState()
  const [ihk, setIhk] = useState()
  const [komoditas, setKomoditas] = useState()
  const [activeSheet, setActiveSheet] = useState("now") // "now" or "prev"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resInflasi = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/inflasi`,
          { kota: "KOTA METRO" }
        )
        const resIhk = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/ihk`,
          { kota: "KOTA METRO" }
        )
        const resKomoditas = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/komoditas`,
          { kota: "KOTA METRO" }
        )

        setInflasi(resInflasi.data)
        setIhk(resIhk.data)
        setKomoditas(resKomoditas.data)
      } catch (err) {
        console.error(err.message)
      }
    }
    fetchData()
  }, [])

  const handleInflasiChange = (index, val) => {
    setInflasi(prev => {
      if (!prev) return prev
      if (activeSheet === "now") {
        const newData = [...prev.data]
        newData[index] = { ...newData[index], value: val }
        return { ...prev, data: newData }
      } else {
        const newYoy = [...prev.yoy]
        newYoy[index] = { ...newYoy[index], value: val }
        return { ...prev, yoy: newYoy }
      }
    })
  }

  const handleIhkChange = (index, val) => {
    setIhk(prev => {
      if (!prev) return prev
      if (activeSheet === "now") {
        const newData = [...prev.data]
        newData[index] = { ...newData[index], value: val }
        return { ...prev, data: newData }
      } else {
        const newYoy = [...prev.yoy]
        newYoy[index] = { ...newYoy[index], value: val }
        return { ...prev, yoy: newYoy }
      }
    })
  }

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ]

  if (!inflasi || !ihk) {
    return (
      <div className={styles.container}>
        <Wrapper>
          <p style={{ color: "#E2E8F0" }}>Memuat data...</p>
        </Wrapper>
      </div>
    )
  }

  const currentYear = new Date().getFullYear()
  const prevYear = currentYear - 1

  const activeDataInflasi = activeSheet === "now" ? inflasi.data : inflasi.yoy
  const activeDataIhk = activeSheet === "now" ? ihk.data : ihk.yoy

  return (
    <div className={styles.container}>
      <Wrapper>
        <p style={{ fontSize: "20px", fontWeight: "bold", color: "#F8FAFC", margin: "0 0 1rem 0" }}>
          Edit Data BPS ({inflasi.kota}) - Tahun {activeSheet === "now" ? currentYear : prevYear}
        </p>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Bulan</th>
                <th>Inflasi (%)</th>
                <th>IHK</th>
              </tr>
            </thead>
            <tbody>
              {activeDataInflasi.map((item, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: "500" }}>{monthNames[index % 12]}</td>
                  <td>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={item.value}
                      onChange={(e) => handleInflasiChange(index, e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={activeDataIhk[index] ? activeDataIhk[index].value : ""}
                      onChange={(e) => handleIhkChange(index, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.sheetTabs}>
          <button
            type="button"
            onClick={() => setActiveSheet("now")}
            className={`${styles.sheetTab} ${activeSheet === "now" ? styles.sheetTabActive : ""}`}
          >
            Sheet Tahun {currentYear}
          </button>
          <button
            type="button"
            onClick={() => setActiveSheet("prev")}
            className={`${styles.sheetTab} ${activeSheet === "prev" ? styles.sheetTabActive : ""}`}
          >
            Sheet Tahun {prevYear} (YoY)
          </button>
        </div>
      </Wrapper>
      {/* <div onClick={() => setStep(2)}>klik</div> */}
    </div>
  )
}

function StepThree(props) {

  const { setStep } = props

  return (
    <div className={styles.container}>
      <Wrapper>tiga</Wrapper>
      <div onClick={() => setStep(0)}>klik</div>
    </div>
  )
}