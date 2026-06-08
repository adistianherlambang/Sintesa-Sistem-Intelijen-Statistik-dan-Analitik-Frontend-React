import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import styles from "./Analisis.module.css"

// component
import Stepper from '../../../components/Stepper/Stepper'
import Wrapper from '../../../components/Wrapper/Wrapper'
import Hierarchy from '../../../components/Hierarchy/Hierarchy'
import MainButton from '../../../components/MainButton/MainButton'
import Input from '../../../components/Input/Input'

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
  const [activeYear, setActiveYear] = useState("now") // "now" or "prev"
  const [activeSheet, setActiveSheet] = useState("main") // "main" or commodity index string ("0", "1", ...)

  const countTreeLeaves = (node) => {
    if (!node || typeof node !== 'object') return 0
    const keys = Object.keys(node)
    if (keys.length === 0) return 1
    return Object.values(node).reduce((sum, child) => sum + countTreeLeaves(child), 0)
  }

  const buildHierarchyData = () => {
    if (!inflasi || !ihk || !komoditas) return {}

    const rootLabel = "Umum"
    const rootChildren = {}

    komoditasList.forEach(c => {
      const cLabel = c.label

      const cChildren = {}
      if (c.sub && Array.isArray(c.sub)) {
        c.sub.forEach(subItem => {
          const subLabel = subItem.label

          cChildren[subLabel] = {}
        })
      }

      rootChildren[cLabel] = cChildren
    })

    return {
      [rootLabel]: rootChildren
    }
  }

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
      if (activeYear === "now") {
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
      if (activeYear === "now") {
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

  const handleKomoditasChange = (commodityIndex, monthIndex, val) => {
    setKomoditas(prev => {
      if (!prev) return prev
      const field = activeYear === "now" ? "hierarki" : "yoy"
      const newList = [...prev[field]]
      const targetCommodity = { ...newList[commodityIndex] }

      const dataKeys = Object.keys(targetCommodity.data || {})
      if (dataKeys[monthIndex]) {
        targetCommodity.data = {
          ...targetCommodity.data,
          [dataKeys[monthIndex]]: val
        }
      }

      newList[commodityIndex] = targetCommodity
      return { ...prev, [field]: newList }
    })
  }

  const handleSubKomoditasChange = (commodityIndex, subIndex, monthIndex, val) => {
    setKomoditas(prev => {
      if (!prev) return prev
      const field = activeYear === "now" ? "hierarki" : "yoy"
      const newList = [...prev[field]]
      const targetCommodity = { ...newList[commodityIndex] }

      const newSubs = [...(targetCommodity.sub || [])]
      const targetSub = { ...newSubs[subIndex] }

      const dataKeys = Object.keys(targetSub.data || {})
      if (dataKeys[monthIndex]) {
        targetSub.data = {
          ...targetSub.data,
          [dataKeys[monthIndex]]: val
        }
      }

      newSubs[subIndex] = targetSub
      targetCommodity.sub = newSubs
      newList[commodityIndex] = targetCommodity

      return { ...prev, [field]: newList }
    })
  }

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ]

  if (!inflasi || !ihk || !komoditas) {
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

  const activeDataInflasi = activeYear === "now" ? inflasi.data : inflasi.yoy
  const activeDataIhk = activeYear === "now" ? ihk.data : ihk.yoy
  const komoditasList = activeYear === "now" ? (komoditas?.hierarki || []) : (komoditas?.yoy || [])

  // Cari commodity item yang aktif jika activeSheet bukan "main"
  const activeCommodityIndex = activeSheet !== "main" ? Number(activeSheet) : null
  const activeCommodity = activeCommodityIndex !== null ? komoditasList[activeCommodityIndex] : null
  const subList = activeCommodity?.sub || []

  const hierarchyData = buildHierarchyData()
  const treeHeight = Math.max(600, countTreeLeaves(hierarchyData) * 90 + 100)

  return (
    <div className={styles.container}>
      <Wrapper>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <p style={{ fontSize: "20px", fontWeight: "bold", color: "#F8FAFC", margin: 0 }}>
            {activeSheet === "main"
              ? `Edit Data BPS (${inflasi.kota}) - Ringkasan`
              : `Edit Sub-Komoditas BPS (${inflasi.kota}) - ${activeCommodity?.label}`
            }
          </p>
          <div style={{ display: "flex", gap: "8px", background: "rgba(255, 255, 255, 0.05)", padding: "4px", borderRadius: "8px" }}>
            <button
              type="button"
              onClick={() => setActiveYear("now")}
              style={{
                padding: "6px 12px",
                border: "none",
                borderRadius: "6px",
                background: activeYear === "now" ? "#34B34A" : "transparent",
                color: activeYear === "now" ? "#FFFFFF" : "#94A3B8",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Tahun {currentYear}
            </button>
            <button
              type="button"
              onClick={() => setActiveYear("prev")}
              style={{
                padding: "6px 12px",
                border: "none",
                borderRadius: "6px",
                background: activeYear === "prev" ? "#34B34A" : "transparent",
                color: activeYear === "prev" ? "#FFFFFF" : "#94A3B8",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Tahun {prevYear} (YoY)
            </button>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            {activeSheet === "main" ? (
              <>
                <thead>
                  <tr>
                    <th>Bulan</th>
                    <th>Inflasi (%)</th>
                    <th>IHK</th>
                    {komoditasList.map((item, cIndex) => (
                      <th key={cIndex}>{item.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeDataInflasi.map((item, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: "500" }}>{monthNames[index % 12]}</td>
                      <td>
                        <Input
                          type="text"
                          value={item.value}
                          setValue={(val) => handleInflasiChange(index, val)}
                        />
                      </td>
                      <td>
                        <Input
                          type="text"
                          value={activeDataIhk[index] ? activeDataIhk[index].value : ""}
                          setValue={(val) => handleIhkChange(index, val)}
                        />
                      </td>
                      {komoditasList.map((cItem, cIndex) => {
                        const dataKeys = Object.keys(cItem.data || {})
                        const targetKey = dataKeys[index]
                        const val = targetKey !== undefined ? cItem.data[targetKey] : ""
                        return (
                          <td key={cIndex}>
                            <Input
                              type="text"
                              value={val}
                              setValue={(newVal) => handleKomoditasChange(cIndex, index, newVal)}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </>
            ) : (
              <>
                <thead>
                  <tr>
                    <th>Bulan</th>
                    {subList.map((subItem, sIndex) => (
                      <th key={sIndex}>{subItem.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeDataInflasi.map((item, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: "500" }}>{monthNames[index % 12]}</td>
                      {subList.map((subItem, sIndex) => {
                        const dataKeys = Object.keys(subItem.data || {})
                        const targetKey = dataKeys[index]
                        const val = targetKey !== undefined ? subItem.data[targetKey] : ""
                        return (
                          <td key={sIndex}>
                            <Input
                              type="text"
                              value={val}
                              setValue={(newVal) => handleSubKomoditasChange(activeCommodityIndex, sIndex, index, newVal)}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>

        <div className={styles.sheetTabs}>
          <button
            type="button"
            onClick={() => setActiveSheet("main")}
            className={`${styles.sheetTab} ${activeSheet === "main" ? styles.sheetTabActive : ""}`}
          >
            Sheet Utama
          </button>
          {komoditas.hierarki.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveSheet(index.toString())}
              className={`${styles.sheetTab} ${activeSheet === index.toString() ? styles.sheetTabActive : ""}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Wrapper>
      <Wrapper>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "20px", fontWeight: "bold", color: "#F8FAFC", margin: 0 }}>
              Visualisasi Struktur Hierarki Komoditas BPS
            </p>
          </div>

          <div style={{
            width: '100%',
            overflow: 'auto',
            maxHeight: '600px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1rem',
            boxSizing: 'border-box'
          }}>
            <Hierarchy
              data={hierarchyData}
              width={1050}
              height={treeHeight}
              fill={"rgba(59, 130, 246, 0.15)"}
              stroke={"#3B82F6"}
              textColor={"#F8FAFC"}
              lineColor={"rgba(255, 255, 255, 0.15)"}
            />
          </div>
        </div>
      </Wrapper>
      <MainButton onClick={() => setStep(2)}>Simpan</MainButton>
      {/* <div onClick={() => setStep(2)}>klik</div> */}
    </div>
  )
}

function StepThree(props) {

  const { setStep } = props

  return (
    <div className={styles.container}>
      <Wrapper>
        <p>Ringkasan AI</p>
      </Wrapper>
      {/* <div onClick={() => setStep(0)}>klik</div> */}
    </div>
  )
}