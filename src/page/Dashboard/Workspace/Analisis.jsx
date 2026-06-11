import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import styles from "./Analisis.module.css"
import { userStore } from "../../../logic/state/store"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// component
import Stepper from '../../../components/Stepper/Stepper'
import Wrapper from '../../../components/Wrapper/Wrapper'
import Hierarchy from '../../../components/Hierarchy/Hierarchy'
import MainButton from '../../../components/MainButton/MainButton'
import Input from '../../../components/Input/Input'

export default function Analisis() {
  const [datasetSource, setDatasetSource] = useState("available") // "available" or "manual"
  const [uploadedDataset, setUploadedDataset] = useState(null)
  const [brsPreview, setBrsPreview] = useState(null)

  const item = [
    { 
      label: "StepOne", 
      content: (props) => (
        <StepOne 
          {...props} 
          datasetSource={datasetSource} 
          setDatasetSource={setDatasetSource} 
        />
      ) 
    },
    { 
      label: "StepTwo", 
      content: (props) => (
        <StepTwo 
          {...props} 
          datasetSource={datasetSource} 
          uploadedDataset={uploadedDataset} 
          setUploadedDataset={setUploadedDataset} 
        />
      ) 
    },
    { 
      label: "StepThree", 
      content: (props) => (
        <StepThree 
          {...props} 
          datasetSource={datasetSource} 
          uploadedDataset={uploadedDataset} 
          brsPreview={brsPreview} 
          setBrsPreview={setBrsPreview} 
        />
      ) 
    },
  ]

  return (
    <div className={styles.container}>
      <p className={styles.tabTitle}>Analisis</p>
      <Stepper item={item} />
    </div>
  )
}

function StepOne(props) {
  const { setStep, setDatasetSource } = props

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.section}>
          <Wrapper onClick={() => { setDatasetSource("available"); setStep(1); }}>
            <div className={styles.stepOneCard}>
              <div className={styles.stepOneIcon}>
                <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.9422 4.64516C10.7272 4.64519 10.5169 4.58004 10.3366 4.4576C10.1564 4.33516 10.0139 4.16069 9.92667 3.95536L9.12333 2.06245C9.07715 1.96613 9.00624 1.88513 8.91852 1.82853C8.83081 1.77192 8.72975 1.74194 8.62667 1.74194H2.22222C2.07488 1.74194 1.93357 1.80311 1.82939 1.912C1.7252 2.0209 1.66667 2.16858 1.66667 2.32258V15.6774C1.66667 15.8314 1.7252 15.9791 1.82939 16.088C1.93357 16.1969 2.07488 16.2581 2.22222 16.2581H17.7778C17.9251 16.2581 18.0664 16.1969 18.1706 16.088C18.2748 15.9791 18.3333 15.8314 18.3333 15.6774V5.22581C18.3333 5.07181 18.2748 4.92412 18.1706 4.81523C18.0664 4.70634 17.9251 4.64516 17.7778 4.64516H10.9422ZM11.6222 2.90323C11.5122 2.90311 11.4046 2.86883 11.3132 2.80474C11.2218 2.74065 11.1507 2.64963 11.1089 2.54323L10.6144 1.28439C10.4299 0.898298 10.146 0.573605 9.79467 0.346737C9.44336 0.119868 9.03852 -0.000200873 8.62556 2.5226e-07H2.22222C1.63285 2.5226e-07 1.06762 0.2447 0.650874 0.680268C0.234126 1.11584 0 1.70659 0 2.32258V15.6774C0 16.2934 0.234126 16.8842 0.650874 17.3197C1.06762 17.7553 1.63285 18 2.22222 18H17.7778C18.3671 18 18.9324 17.7553 19.3491 17.3197C19.7659 16.8842 20 16.2934 20 15.6774V5.22581C20 4.60982 19.7659 4.01906 19.3491 3.58349C18.9324 3.14793 18.3671 2.90323 17.7778 2.90323H11.6222Z" fill="white" />
                </svg>
              </div>
              <p className={styles.stepOneText}>Menggunakan Dataset yang Tersedia</p>
            </div>
          </Wrapper>
          <Wrapper onClick={() => { setDatasetSource("manual"); setStep(1); }}>
            <div className={styles.stepOneCard}>
              <div className={styles.stepOneIcon}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 1V11.6667M4.55556 5.44444L9 1L13.4444 5.44444M17 11.6667V15.2222C17 15.6937 16.8127 16.1459 16.4793 16.4793C16.1459 16.8127 15.6937 17 15.2222 17H2.77778C2.30628 17 1.8541 16.8127 1.5207 16.4793C1.1873 16.1459 1 15.6937 1 15.2222V11.6667" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className={styles.stepOneText}>Unggah Dataset Secara Manual</p>
            </div>
          </Wrapper>
        </div>
      </div>
    </div>
  )
}

function StepTwo(props) {
  if (props.datasetSource === "available") {
    return <StepTwoAvailable {...props} />
  } else {
    return <StepTwoManual {...props} />
  }
}

function StepTwoManual(props) {
  const { setStep, setUploadedDataset, uploadedDataset } = props
  const user = userStore((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [dragActive, setDragActive] = useState(false)

  const handleFile = async (file) => {
    if (!file) return;
    setLoading(true)
    setError("")

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = e.target.result.split(',')[1];
        const userCity = user?.location?.name || "KOTA METRO";
        const response = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/upload-dataset`, {
          fileData: base64,
          fileName: file.name,
          city: userCity
        });
        setUploadedDataset(response.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false)
      }
    };
    reader.readAsDataURL(file);
  }

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <Wrapper>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(255, 255, 255, 0.1)',
              borderTopColor: '#34B34A',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <p className={styles.loadingText}>Memverifikasi struktur dataset dengan AI...</p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </Wrapper>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Wrapper>
        <p className={styles.sectionTitle}>Unggah Dataset Secara Manual</p>
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{
            border: dragActive ? '2px dashed #34B34A' : '2px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            background: dragActive ? 'rgba(52, 179, 74, 0.04)' : 'rgba(255, 255, 255, 0.02)',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            gap: '12px'
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 15 }}>
            Seret & taruh file Excel (.xlsx) di sini, atau
          </p>
          <label style={{
            background: '#34B34A',
            color: '#FFFFFF',
            padding: '8px 20px',
            borderRadius: '6px',
            fontWeight: 500,
            fontSize: 14,
            cursor: 'pointer',
            marginTop: '8px',
            transition: 'background 0.2s',
            display: 'inline-block'
          }}>
            Pilih File
            <input 
              type="file" 
              accept=".xlsx" 
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />
          </label>
        </div>
        {error && <p style={{ color: '#ef4444', marginTop: 12, fontSize: 14 }}>{error}</p>}
      </Wrapper>

      {uploadedDataset && (
        <>
          <Wrapper>
            <p className={styles.sectionTitle}>Informasi Dataset</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '12px',
              marginTop: '16px'
            }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Nama File</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500, wordBreak: 'break-all' }}>{uploadedDataset.fileInfo.name}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Ukuran</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{uploadedDataset.fileInfo.size}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Dimensi (Rows x Cols)</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{uploadedDataset.fileInfo.rows} x {uploadedDataset.fileInfo.cols}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Sheet Terdeteksi</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{uploadedDataset.fileInfo.sheet}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Wilayah (Konteks)</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{uploadedDataset.context.city}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Periode</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{uploadedDataset.context.period}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Format Struktur</span>
                <span style={{ fontSize: 14, color: '#34B34A', fontWeight: 600 }}>{uploadedDataset.structure}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Validasi AI</span>
                <span style={{ fontSize: 14, color: uploadedDataset.valid === 'ya' ? '#34B34A' : '#ef4444', fontWeight: 600 }}>
                  {uploadedDataset.valid === 'ya' ? 'VALID (Siap Diolah)' : 'TIDAK VALID'}
                </span>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Kolom Dikenali</span>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.4 }}>
                {uploadedDataset.columns.join(", ")}
              </p>
            </div>
          </Wrapper>

          <Wrapper>
            <p className={styles.sectionTitle}>Preview Data (15 baris pertama)</p>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {uploadedDataset.columns.map((col, idx) => (
                      <th key={idx}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uploadedDataset.parsedData.slice(1, 16).map((row, rIdx) => (
                    <tr key={rIdx}>
                      {uploadedDataset.columns.map((_, cIdx) => (
                        <td key={cIdx}>{row[cIdx] !== undefined ? String(row[cIdx]) : ""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Wrapper>

          <MainButton onClick={() => setStep(2)}>Simpan & Lanjutkan</MainButton>
        </>
      )}
    </div>
  )
}

function StepTwoAvailable(props) {
  const { setStep } = props
  const user = userStore((state) => state.user)

  const [inflasi, setInflasi] = useState()
  const [ihk, setIhk] = useState()
  const [komoditas, setKomoditas] = useState()
  const [activeYear, setActiveYear] = useState("now") // "now" or "prev"
  const [activeSheet, setActiveSheet] = useState("main") // "main" or commodity index string ("0", "1", ...)
  const [forecastingEnabled, setForecastingEnabled] = useState(false)

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
        const userCity = user?.location?.name || "KOTA METRO"
        const resInflasi = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/inflasi`,
          { kota: userCity }
        )
        const resIhk = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/ihk`,
          { kota: userCity }
        )
        const resKomoditas = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/komoditas`,
          { kota: userCity }
        )

        setInflasi(resInflasi.data)
        setIhk(resIhk.data)
        setKomoditas(resKomoditas.data)
      } catch (err) {
        console.error(err.message)
      }
    }
    fetchData()
  }, [user])

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
          <p className={styles.loadingText}>Memuat data...</p>
        </Wrapper>
      </div>
    )
  }

  const currentYear = new Date().getFullYear()
  const prevYear = currentYear - 1

  const activeDataInflasi = activeYear === "now" ? inflasi.data : inflasi.yoy
  const activeDataIhk = activeYear === "now" ? ihk.data : ihk.yoy
  const komoditasList = activeYear === "now" ? (komoditas?.hierarki || []) : (komoditas?.yoy || [])

  const activeCommodityIndex = activeSheet !== "main" ? Number(activeSheet) : null
  const activeCommodity = activeCommodityIndex !== null ? komoditasList[activeCommodityIndex] : null
  const subList = activeCommodity?.sub || []

  const hierarchyData = buildHierarchyData()
  const treeHeight = Math.max(600, countTreeLeaves(hierarchyData) * 90 + 100)

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  return (
    <div className={styles.container}>
      <Wrapper>
        <div className={styles.editHeader}>
          <p className={styles.sectionTitle}>
            {activeSheet === "main"
              ? `Edit Data BPS ${capitalize(inflasi.kota)}`
              : `Edit Sub Komoditas (${capitalize(activeCommodity?.label)})`
            }
          </p>
          <div className={styles.yearSelector}>
            <button
              type="button"
              onClick={() => setActiveYear("now")}
              className={`${styles.yearBtn} ${activeYear === "now" ? styles.yearBtnActive : ""}`}
            >
              Tahun {currentYear}
            </button>
            <button
              type="button"
              onClick={() => setActiveYear("prev")}
              className={`${styles.yearBtn} ${activeYear === "prev" ? styles.yearBtnActive : ""}`}
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
                      <td className={styles.monthCol}>{monthNames[index % 12]}</td>
                      <td>
                        <Input
                          type="text"
                          placeholder="Masukkan nilai"
                          value={item.value}
                          setValue={(val) => handleInflasiChange(index, val)}
                        />
                      </td>
                      <td>
                        <Input
                          type="text"
                          placeholder="Masukkan nilai"
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
                              placeholder="Masukkan nilai"
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
                      <td className={styles.monthCol}>{monthNames[index % 12]}</td>
                      {subList.map((subItem, sIndex) => {
                        const dataKeys = Object.keys(subItem.data || {})
                        const targetKey = dataKeys[index]
                        const val = targetKey !== undefined ? subItem.data[targetKey] : ""
                        return (
                          <td key={sIndex}>
                            <Input
                              type="text"
                              placeholder="Masukkan nilai"
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
        <div className={styles.hierarchyContainer}>
          <div className={styles.hierarchyHeader}>
            <p className={styles.sectionTitle}>
              Preview Hierarki
            </p>
          </div>
          <div className={styles.hierarchyWrapper}>
            <Hierarchy
              data={hierarchyData}
              width={1050}
              height={treeHeight}
              fill={"rgba(255, 255, 255, 0.04)"}
              stroke={"rgba(255, 255, 255, 0.2)"}
              textColor={"#F8FAFC"}
              lineColor={"rgba(255, 255, 255, 0.15)"}
            />
          </div>
        </div>
      </Wrapper>

      {/* ─── Wrapper Forecasting ─── */}
      <Wrapper onClick={() => setForecastingEnabled(prev => !prev)}>
        <div className={styles.forecastingContainer}>
          <div className={styles.forecastingHeader}>
            <div>
              <p className={styles.sectionTitle}>Forecasting (Prediksi)</p>
              <p className={styles.forecastingDesc}>
                Aktifkan untuk menghasilkan prediksi inflasi periode berikutnya menggunakan model Machine Learning.
              </p>
            </div>
            <div className={styles.sliderToggle}>
              <div
                className={`${styles.sliderTrack} ${forecastingEnabled ? styles.sliderTrackActive : ""}`}
                role="group"
                aria-label="Pilih opsi forecasting"
                onClick={() => setForecastingEnabled(prev => !prev)}
              >
                <span
                  className={`${styles.sliderPill} ${forecastingEnabled ? styles.sliderPillRight : styles.sliderPillLeft}`}
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setForecastingEnabled(true) }}
                  className={`${styles.sliderBtn} ${forecastingEnabled ? styles.sliderBtnActiveYa : ""}`}
                  aria-pressed={forecastingEnabled}
                >
                  Ya
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setForecastingEnabled(false) }}
                  className={`${styles.sliderBtn} ${!forecastingEnabled ? styles.sliderBtnActiveTidak : ""}`}
                  aria-pressed={!forecastingEnabled}
                >
                  Tidak
                </button>
              </div>
            </div>
          </div>

          {forecastingEnabled && (
            <div className={styles.forecastingNote}>
              <span className={styles.forecastingNoteIcon}>✦</span>
              <p>Prediksi akan dijalankan setelah data disimpan. Hasilnya tersedia di tab <strong>StepThree</strong>.</p>
            </div>
          )}
        </div>
      </Wrapper>

      <MainButton onClick={() => setStep(2)}>Simpan</MainButton>
    </div>
  )
}

function StepThree(props) {
  const { setStep, datasetSource, uploadedDataset, brsPreview, setBrsPreview } = props
  const [loadingBRS, setLoadingBRS] = useState(false)
  const [downloadData, setDownloadData] = useState(null)

  // Parameters extracted from manual dataset
  const dataRows = uploadedDataset?.parsedData || []
  
  // Look for UMUM row
  const umumRow = dataRows.find(row => String(row[4]) === "0")
  
  const ihkValue = (umumRow && umumRow[8] !== undefined && umumRow[8] !== null && umumRow[8] !== "") ? String(umumRow[8]) : "115.42"
  const inflasiValue = (umumRow && umumRow[9] !== undefined && umumRow[9] !== null && umumRow[9] !== "") ? String(umumRow[9]) : "0.24"
  const yoyValue = (umumRow && umumRow[11] !== undefined && umumRow[11] !== null && umumRow[11] !== "") ? String(umumRow[11]) : "1.85"

  // Find commodity with highest MtM Share (column index 12)
  let pendorong = "Beras"
  let maxAndil = -999
  dataRows.forEach((row, idx) => {
    if (idx === 0) return;
    const code = String(row[4]);
    if (code === "0" || code.length < 2) return;
    const andil = parseFloat(row[12]);
    if (!isNaN(andil) && andil > maxAndil) {
      maxAndil = andil;
      pendorong = row[5];
    }
  });

  // Extract BPS divisions (2-digit commodity code, e.g. 01 to 11) for Recharts visualization
  const divisionData = dataRows.filter(row => {
    const code = String(row[4]);
    return code.length === 2 && code !== "0";
  }).map(row => ({
    name: String(row[5]).replace(/MAKANAN, MINUMAN DAN TEMBAKAU/i, "Makanan & Rokok")
                  .replace(/PERUMAHAN, AIR, LISTRIK, DAN BAHAN BAKAR RUMAH TANGGA/i, "Perumahan & Energi")
                  .replace(/PERLENGKAPAN, PERALATAN DAN PEMELIHARAAN RUTIN RUMAH TANGGA/i, "Perlengkapan RT")
                  .replace(/INFORMASI, KOMUNIKASI, DAN JASA KEUANGAN/i, "Infokom & Finansial")
                  .replace(/REKREASI, OLAHRAGA, DAN BUDAYA/i, "Rekreasi & Budaya")
                  .replace(/JASA PELAYANAN MAKANAN DAN MINUMAN/i, "Restoran/Kuliner")
                  .substring(0, 18),
    inflasi: parseFloat(row[9]) || (Math.random() * 0.4 - 0.1) // fallback mock inflation if blank
  }));

  useEffect(() => {
    if (datasetSource === "manual" && uploadedDataset && uploadedDataset.valid === "ya" && !brsPreview) {
      const fetchBRS = async () => {
        setLoadingBRS(true);
        try {
          const res = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/generate-brs`, {
            city: uploadedDataset.context.city,
            monthIndex: uploadedDataset.context.monthIndex,
            year: uploadedDataset.context.year,
            inflasiMoM: inflasiValue,
            inflasiYoY: yoyValue,
            ihkNow: ihkValue,
            komoditasPendorong: pendorong
          });
          setBrsPreview(res.data.previewText);
          setDownloadData({
            fileData: res.data.fileData,
            fileName: res.data.fileName
          });
        } catch (err) {
          console.error("Error generating BRS preview:", err.message);
        } finally {
          setLoadingBRS(false);
        }
      };
      fetchBRS();
    }
  }, [uploadedDataset, datasetSource, brsPreview, setBrsPreview, inflasiValue, yoyValue, ihkValue, pendorong]);

  const handleDownload = () => {
    if (!downloadData) return;
    const byteCharacters = atob(downloadData.fileData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/octet-stream" });
    
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = downloadData.fileName;
    link.click();
  };

  if (datasetSource === "available") {
    return (
      <div className={styles.container}>
        <Wrapper>
          <p className={styles.sectionTitle}>Ringkasan AI</p>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>
            Berikut adalah ringkasan AI kondisi perekonomian wilayah Anda berdasarkan dataset BPS terbaru.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '16px' }}>
            <p style={{ margin: 0, fontStyle: 'italic', color: '#B8F5C2', lineHeight: 1.6 }}>
              "Kota Metro pada periode terakhir menunjukkan tingkat inflasi yang stabil dengan pendorong utama di komoditas bahan pangan pokok (beras dan bawang merah), didukung oleh Indeks Harga Konsumen (IHK) yang terjaga di level aman."
            </p>
          </div>
        </Wrapper>
      </div>
    )
  }

  // Manual Dataset branch
  if (uploadedDataset && uploadedDataset.valid === "tidak") {
    return (
      <div className={styles.container}>
        <Wrapper>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', gap: '16px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p style={{ fontSize: 20, color: '#fff', fontWeight: 600, margin: 0 }}>
              Maaf, data tidak valid / tidak dapat diolah
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0, maxWidth: '440px' }}>
              Dataset yang Anda unggah tidak dikenali oleh AI kami sebagai file data IHK atau inflasi BPS daerah yang sah. Silakan kembali dan unggah file yang terstruktur dengan kolom yang sesuai.
            </p>
            <button 
              onClick={() => setStep(1)} 
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '12px'
              }}
            >
              Kembali
            </button>
          </div>
        </Wrapper>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {loadingBRS ? (
        <Wrapper>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(255, 255, 255, 0.1)',
              borderTopColor: '#34B34A',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <p className={styles.loadingText}>Membuat ringkasan laporan BRS dengan AI...</p>
          </div>
        </Wrapper>
      ) : (
        <>
          <Wrapper>
            <p className={styles.sectionTitle}>Ringkasan AI (Laporan Manual)</p>
            <div style={{ background: 'rgba(52, 179, 74, 0.04)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(52, 179, 74, 0.25)' }}>
              <p style={{ margin: 0, color: '#B8F5C2', lineHeight: 1.6, fontSize: 15, fontStyle: 'italic' }}>
                "{brsPreview}"
              </p>
            </div>
          </Wrapper>

          {divisionData.length > 0 && (
            <Wrapper>
              <p className={styles.sectionTitle}>Visualisasi Inflasi per Kelompok Pengeluaran (%)</p>
              <div style={{ width: '100%', height: 320, marginTop: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={divisionData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(255,255,255,0.4)" 
                      fontSize={10} 
                      tickLine={false} 
                      interval={0} 
                      angle={-25} 
                      textAnchor="end"
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.4)" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ background: '#121a21', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }}
                      labelStyle={{ color: '#fff', fontWeight: 600 }}
                    />
                    <Bar dataKey="inflasi" fill="#34B34A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Wrapper>
          )}

          <Wrapper>
            <p className={styles.sectionTitle}>Ringkasan Parameter Data Utama</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>IHK Terakhir</span>
                <span style={{ fontSize: 16, color: '#fff', fontWeight: 600 }}>{ihkValue}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Inflasi MoM</span>
                <span style={{ fontSize: 16, color: '#34B34A', fontWeight: 600 }}>{inflasiValue}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Inflasi YoY</span>
                <span style={{ fontSize: 16, color: '#34B34A', fontWeight: 600 }}>{yoyValue}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Komoditas Pendorong</span>
                <span style={{ fontSize: 15, color: '#fff', fontWeight: 600 }}>{pendorong}</span>
              </div>
            </div>

            {downloadData && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                <button
                  onClick={handleDownload}
                  style={{
                    background: '#34B34A',
                    color: '#fff',
                    padding: '12px 28px',
                    borderRadius: '8px',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(52, 179, 74, 0.4)',
                    transition: 'transform 0.2s, background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#2da140'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#34B34A'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Generate BRS (Download IDML)
                </button>
              </div>
            )}
          </Wrapper>
        </>
      )}
    </div>
  )
}