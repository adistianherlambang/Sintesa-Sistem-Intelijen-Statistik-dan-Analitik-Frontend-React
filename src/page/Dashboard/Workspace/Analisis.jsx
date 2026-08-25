import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import styles from "./Analisis.module.css"
import { userStore } from "../../../logic/state/store"

// component
import Stepper from '../../../components/Stepper/Stepper'
import Wrapper from '../../../components/Wrapper/Wrapper'
import Hierarchy from '../../../components/Hierarchy/Hierarchy'
import MainButton from '../../../components/MainButton/MainButton'
import Input from '../../../components/Input/Input'
import Skeleton from '../../../components/Skeleton/Skeleton'
import AILoader from '../../../components/AILoader/AILoader'

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
          <AILoader text="Memverifikasi struktur dataset dengan AI..." minHeight="220px" />
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
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px',  }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Nama File</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500, wordBreak: 'break-all' }}>{uploadedDataset.fileInfo.name}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px',  }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Ukuran</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{uploadedDataset.fileInfo.size}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px',  }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Dimensi (Rows x Cols)</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{uploadedDataset.fileInfo.rows} x {uploadedDataset.fileInfo.cols}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px',  }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Sheet Terdeteksi</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{uploadedDataset.fileInfo.sheet}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px',  }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Wilayah (Konteks)</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{uploadedDataset.context.city}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px',  }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Periode</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{uploadedDataset.context.period}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px',  }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Format Struktur</span>
                <span style={{ fontSize: 14, color: '#34B34A', fontWeight: 600 }}>{uploadedDataset.structure}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px',  }}>
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
  const { setStep, setUploadedDataset } = props
  const user = userStore((state) => state.user)

  const [inflasiData, setInflasiData] = useState({ mom: null, yoy: null, ytd: null })
  const [ihkData, setIhkData] = useState(null)
  const [komoditasData, setKomoditasData] = useState({ mom: null, yoy: null, ytd: null })

  const [metricType, setMetricType] = useState("mom") // "mom", "yoy", "ytd"
  const [activeYear, setActiveYear] = useState("now") // "now", "prev", "prev2"
  const [activeSheet, setActiveSheet] = useState("main") // "main" or commodity index string ("0", "1", ...)
  const [forecastingEnabled, setForecastingEnabled] = useState(false)

  const currentYear = new Date().getFullYear()
  const prevYear = currentYear - 1
  const prev2Year = currentYear - 2

  const activeInflasiObj = inflasiData[metricType]
  const activeDataInflasi = useMemo(() => {
    if (!activeInflasiObj) return []
    if (activeYear === "now") return activeInflasiObj.data || []
    if (activeYear === "prev") return activeInflasiObj.prevYear || []
    return activeInflasiObj.prev2Year || []
  }, [activeInflasiObj, activeYear])

  const activeDataIhk = useMemo(() => {
    if (!ihkData) return []
    if (activeYear === "now") return ihkData.data || []
    if (activeYear === "prev") return ihkData.prevYear || []
    return ihkData.prev2Year || []
  }, [ihkData, activeYear])

  const activeKomoditasObj = komoditasData[metricType]
  const komoditasList = useMemo(() => {
    if (!activeKomoditasObj) return []
    if (activeYear === "now") return activeKomoditasObj.hierarki || []
    if (activeYear === "prev") return activeKomoditasObj.prevYear || activeKomoditasObj.prevYearList || []
    return activeKomoditasObj.prev2Year || activeKomoditasObj.prev2YearList || []
  }, [activeKomoditasObj, activeYear])

  const userCityName = useMemo(() => {
    return activeInflasiObj?.kota || user?.location?.name || ""
  }, [activeInflasiObj, user])

  const handleSave = () => {
    let monthIndex = 0;
    for (let i = 11; i >= 0; i--) {
      if (activeDataInflasi[i] && activeDataInflasi[i].value !== undefined && activeDataInflasi[i].value !== "") {
        monthIndex = i;
        break;
      }
    }

    const periodText = `${monthNames[monthIndex]} ${currentYear}`;
    const infValue = activeDataInflasi?.[monthIndex]?.value || "0.00";
    const yValue = inflasiData.yoy?.data?.[monthIndex]?.value || "0.00";
    const iValue = activeDataIhk?.[monthIndex]?.value || "100.00";

    const divisions = komoditasList.map(c => {
      const dataKeys = Object.keys(c.data || {});
      const targetKey = dataKeys[monthIndex];
      return {
        name: c.label,
        inflasi: parseFloat(c.data?.[targetKey]) || 0
      };
    });

    const parsedData = [
      ["Tahun", "Bulan", "Kode Kota", "Nama Kota", "Kode Komoditas", "Nama Komoditas", "Timbangan", "IHK Lalu", "IHK", "Inflasi", "Inflasi YtD", "Inflasi YoY", "Andil"],
      [currentYear, monthIndex + 1, "1872", userCityName, "0", "UMUM", "100", "100", iValue, infValue, "0", yValue, "0"],
    ];

    divisions.forEach((div, idx) => {
      const code = String(idx + 1).padStart(2, "0");
      parsedData.push([currentYear, monthIndex + 1, "1872", userCityName, code, div.name, "10", "10", "100", String(div.inflasi), "0", "0", String(div.inflasi)]);
    });

    setUploadedDataset({
      valid: "ya",
      fileInfo: {
        name: "Database BPS",
        size: "N/A",
        rows: parsedData.length,
        cols: 13,
        sheet: "Sheet Utama"
      },
      context: {
        city: userCityName,
        period: periodText,
        monthIndex: monthIndex,
        year: currentYear
      },
      structure: "BPS Inflasi / IHK",
      columns: parsedData[0],
      parsedData: parsedData,
      editedData: { inflasiData, ihkData, komoditasData }
    });

    setStep(2);
  };

  const komoditasLabelsKey = useMemo(() => {
    if (!komoditasList) return "";
    return komoditasList.map(c => `${c.label}:${(c.sub || []).map(s => s.label).join(",")}`).join("|");
  }, [komoditasList]);

  const countTreeLeaves = (node) => {
    if (!node || typeof node !== 'object') return 0
    const keys = Object.keys(node)
    if (keys.length === 0) return 1
    return Object.values(node).reduce((sum, child) => sum + countTreeLeaves(child), 0)
  }

  const hierarchyData = useMemo(() => {
    if (!inflasiData.mom || !ihkData || !komoditasData.mom) return {}

    const rootLabel = "Umum"
    const rootChildren = {}

    komoditasList.forEach(c => {
      const cLabel = c.label
      const cChildren = {}
      if (c.sub && Array.isArray(c.sub)) {
        c.sub.forEach(subItem => {
          cChildren[subItem.label] = {}
        })
      }
      rootChildren[cLabel] = cChildren
    })

    return {
      [rootLabel]: rootChildren
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [komoditasLabelsKey])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userCity = user?.location?.name || ""
        const [
          resInflasiMom,
          resInflasiYoy,
          resInflasiYtd,
          resIhk,
          resKomoditasMom,
          resKomoditasYoy,
          resKomoditasYtd,
        ] = await Promise.all([
          axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/inflasi`, { kota: userCity }).catch(() => ({ data: null })),
          axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/inflasi/yoy`, { kota: userCity }).catch(() => ({ data: null })),
          axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/inflasi/ytd`, { kota: userCity }).catch(() => ({ data: null })),
          axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/ihk`, { kota: userCity }).catch(() => ({ data: null })),
          axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/komoditas`, { kota: userCity }).catch(() => ({ data: null })),
          axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/komoditas/yoy`, { kota: userCity }).catch(() => ({ data: null })),
          axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/komoditas/ytd`, { kota: userCity }).catch(() => ({ data: null })),
        ])

        setInflasiData({
          mom: resInflasiMom.data,
          yoy: resInflasiYoy.data,
          ytd: resInflasiYtd.data,
        })
        setIhkData(resIhk.data)
        setKomoditasData({
          mom: resKomoditasMom.data,
          yoy: resKomoditasYoy.data,
          ytd: resKomoditasYtd.data,
        })
      } catch (err) {
        console.error(err.message)
      }
    }
    fetchData()
  }, [user])

  const handleInflasiChange = (index, val) => {
    setInflasiData(prev => {
      const targetObj = prev[metricType]
      if (!targetObj) return prev
      const targetField = activeYear === "now" ? "data" : activeYear === "prev" ? "prevYear" : "prev2Year"
      const newList = [...(targetObj[targetField] || [])]
      newList[index] = { ...newList[index], value: val }
      return {
        ...prev,
        [metricType]: {
          ...targetObj,
          [targetField]: newList,
        }
      }
    })
  }

  const handleIhkChange = (index, val) => {
    setIhkData(prev => {
      if (!prev) return prev
      const targetField = activeYear === "now" ? "data" : activeYear === "prev" ? "prevYear" : "prev2Year"
      const newList = [...(prev[targetField] || [])]
      newList[index] = { ...newList[index], value: val }
      return {
        ...prev,
        [targetField]: newList,
      }
    })
  }

  const handleKomoditasChange = (commodityIndex, monthIndex, val) => {
    setKomoditasData(prev => {
      const targetObj = prev[metricType]
      if (!targetObj) return prev
      const targetField = activeYear === "now" ? "hierarki" : activeYear === "prev" ? (targetObj.prevYear ? "prevYear" : "prevYearList") : (targetObj.prev2Year ? "prev2Year" : "prev2YearList")
      const newList = [...(targetObj[targetField] || [])]
      const targetCommodity = { ...newList[commodityIndex] }

      const dataKeys = Object.keys(targetCommodity.data || {})
      if (dataKeys[monthIndex]) {
        targetCommodity.data = {
          ...targetCommodity.data,
          [dataKeys[monthIndex]]: val
        }
      }

      newList[commodityIndex] = targetCommodity
      return {
        ...prev,
        [metricType]: {
          ...targetObj,
          [targetField]: newList,
        }
      }
    })
  }

  const handleSubKomoditasChange = (commodityIndex, subIndex, monthIndex, val) => {
    setKomoditasData(prev => {
      const targetObj = prev[metricType]
      if (!targetObj) return prev
      const targetField = activeYear === "now" ? "hierarki" : activeYear === "prev" ? (targetObj.prevYear ? "prevYear" : "prevYearList") : (targetObj.prev2Year ? "prev2Year" : "prev2YearList")
      const newList = [...(targetObj[targetField] || [])]
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

      return {
        ...prev,
        [metricType]: {
          ...targetObj,
          [targetField]: newList,
        }
      }
    })
  }

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ]

  if (!inflasiData.mom || !ihkData || !komoditasData.mom) {
    return (
      <div className={styles.container}>
        <Wrapper>
          <p className={styles.sectionTitle}>Memuat Data BPS...</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            <Skeleton height="42px" />
            <Skeleton height="200px" />
          </div>
        </Wrapper>
      </div>
    )
  }

  const activeCommodityIndex = activeSheet !== "main" ? Number(activeSheet) : null
  const activeCommodity = activeCommodityIndex !== null ? komoditasList[activeCommodityIndex] : null
  const subList = activeCommodity?.sub || []

  const treeHeight = Math.max(600, countTreeLeaves(hierarchyData) * 90 + 100)

  function capitalize(str) {
    if (!str) return ""
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  return (
    <div className={styles.container}>
      <Wrapper>
        <div className={styles.editHeader}>
          <p className={styles.sectionTitle}>
            {activeSheet === "main"
              ? `Edit Data BPS ${capitalize(userCityName)}`
              : `Edit Sub Komoditas (${capitalize(activeCommodity?.label)})`
            }
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Metric Type Selector (MoM, YoY, YtD) */}
            <div className={styles.yearSelector}>
              <button
                type="button"
                onClick={() => setMetricType("mom")}
                className={`${styles.yearBtn} ${metricType === "mom" ? styles.yearBtnActive : ""}`}
              >
                MoM
              </button>
              <button
                type="button"
                onClick={() => setMetricType("yoy")}
                className={`${styles.yearBtn} ${metricType === "yoy" ? styles.yearBtnActive : ""}`}
              >
                YoY
              </button>
              <button
                type="button"
                onClick={() => setMetricType("ytd")}
                className={`${styles.yearBtn} ${metricType === "ytd" ? styles.yearBtnActive : ""}`}
              >
                YtD
              </button>
            </div>

            {/* Year Selector (year.now, year - 1, year - 2) */}
            <div className={styles.yearSelector}>
              <button
                type="button"
                onClick={() => setActiveYear("now")}
                className={`${styles.yearBtn} ${activeYear === "now" ? styles.yearBtnActive : ""}`}
              >
                Tahun {currentYear} (year.now)
              </button>
              <button
                type="button"
                onClick={() => setActiveYear("prev")}
                className={`${styles.yearBtn} ${activeYear === "prev" ? styles.yearBtnActive : ""}`}
              >
                Tahun {prevYear} (year - 1)
              </button>
              <button
                type="button"
                onClick={() => setActiveYear("prev2")}
                className={`${styles.yearBtn} ${activeYear === "prev2" ? styles.yearBtnActive : ""}`}
              >
                Tahun {prev2Year} (year - 2)
              </button>
            </div>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            {activeSheet === "main" ? (
              <>
                <thead>
                  <tr>
                    <th>Bulan</th>
                    <th>Inflasi {metricType.toUpperCase()} (%)</th>
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
          {komoditasList.map((item, index) => (
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
              <p>Prediksi akan dijalankan setelah data disimpan. Hasilnya tersedia di tab <strong>Selanjutnya</strong>.</p>
            </div>
          )}
        </div>
      </Wrapper>

      <MainButton onClick={handleSave}>Simpan & Lanjutkan</MainButton>
    </div>
  )
}

function StepThree(props) {
  const { setStep, datasetSource, uploadedDataset } = props
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [aiSummary, setAiSummary] = useState(null)
  const [generatingBRS, setGeneratingBRS] = useState(false)
  const [savedHistoryId, setSavedHistoryId] = useState(null)
  const [error, setError] = useState("")

  // Parameters extracted from manual dataset
  const dataRows = useMemo(() => {
    return uploadedDataset?.parsedData || [];
  }, [uploadedDataset?.parsedData]);

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

  const divisionData = useMemo(() => {
    return dataRows.filter(row => {
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
      inflasi: parseFloat(row[9]) || 0
    }));
  }, [dataRows]);

  // Fetch structured JSON AI summary on mount/load
  useEffect(() => {
    if (uploadedDataset && uploadedDataset.valid === "ya" && !aiSummary) {
      const fetchSummary = async () => {
        setLoadingSummary(true);
        setError("");
        try {
          const res = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/generate-summary`, {
            city: uploadedDataset.context.city,
            periode: uploadedDataset.context.period,
            inflasiMoM: inflasiValue,
            inflasiYoY: yoyValue,
            ihkNow: ihkValue,
            komoditasPendorong: pendorong,
            divisionData: divisionData,
            editedData: uploadedDataset?.editedData,
            parsedData: uploadedDataset?.parsedData
          });
          setAiSummary(res.data);
        } catch (err) {
          console.error("Error generating AI summary:", err.message);
          setError("Gagal menghasilkan ringkasan AI: " + err.message);
        } finally {
          setLoadingSummary(false);
        }
      };
      fetchSummary();
    }
  }, [uploadedDataset, datasetSource, aiSummary, inflasiValue, yoyValue, ihkValue, pendorong, divisionData]);

  const handleSaveAndGenerate = async () => {
    if (!aiSummary) return;
    setGeneratingBRS(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/generate-and-save-brs`,
        {
          city: uploadedDataset.context.city,
          monthIndex: uploadedDataset.context.monthIndex,
          year: uploadedDataset.context.year,
          inflasiMoM: inflasiValue,
          inflasiYoY: yoyValue,
          ihkNow: ihkValue,
          komoditasPendorong: pendorong,
          aiSummary: aiSummary.sections,
          divisionData: divisionData,
          editedData: uploadedDataset?.editedData,
          parsedData: uploadedDataset?.parsedData
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSavedHistoryId(res.data.historyId);
    } catch (err) {
      console.error("Error generating/saving BRS report:", err.message);
      setError("Gagal men-generate BRS: " + (err.response?.data?.message || err.message));
    } finally {
      setGeneratingBRS(false);
    }
  };

  const handleDownloadIDML = async () => {
    if (!savedHistoryId) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_URL_SERVER}/api/users/analysis/${savedHistoryId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `perkembanganIHK_${uploadedDataset.context.city.replace(/\s+/g, '_')}_${uploadedDataset.context.period.replace(/\s+/g, '_')}.idml`;
      link.click();
    } catch (err) {
      console.error("Gagal mengunduh IDML:", err.message);
      if (err.response && err.response.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorObj = JSON.parse(reader.result);
            setError(`Gagal mengunduh file IDML: ${errorObj.message || "Terjadi kesalahan"}`);
          } catch (e) {
            setError("Gagal mengunduh file IDML.");
          }
        };
        reader.readAsText(err.response.data);
      } else {
        setError("Gagal mengunduh file IDML.");
      }
    }
  };
  // Unified AI summary and BRS report generation flow for both sources

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
      {loadingSummary ? (
        <Wrapper>
          <AILoader text="Menganalisis data & membuat ringkasan AI..." minHeight="220px" />
        </Wrapper>
      ) : (
        <>
          {aiSummary && (
            <Wrapper>
              <div className={styles.sectionWrapper}>
                <div className={styles.iconWrapper}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.2778 0C17.3848 3.22733 16.2346 4.32988 13.0556 5.22222C16.2346 6.11457 17.3848 7.21711 18.2778 10.4444C19.1708 7.21711 20.321 6.11457 23.5 5.22222C20.321 4.32988 19.1708 3.22733 18.2778 0ZM9.13889 5.22222C7.57549 10.8694 5.56428 12.7997 0 14.3611C5.56428 15.9226 7.57549 17.8528 9.13889 23.5C10.7023 17.8528 12.7135 15.9226 18.2778 14.3611C12.7135 12.7997 10.7023 10.8694 9.13889 5.22222Z" fill="#34B34A" />
                  </svg>
                </div>
                <div>
                  <p className={styles.sectionTitle}>Ringkasan AI</p>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 13, marginBottom: '16px', fontStyle: "italic" }}>
                    Berikut adalah butir-butir ringkasan kondisi perekonomian wilayah Anda yang dihasilkan oleh AI:
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {aiSummary.sections?.map((section, idx) => (
                  <Wrapper key={idx}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                      {section.content}
                    </p>
                  </Wrapper>
                ))}
              </div>
            </Wrapper>
          )}

          {/* {divisionData.length > 0 && (
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
                      contentStyle={{ background: '#121a21',  borderRadius: '6px' }}
                      labelStyle={{ color: '#fff', fontWeight: 600 }}
                    />
                    <Bar dataKey="inflasi" fill="#34B34A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Wrapper>
          )} */}

          <Wrapper>
            <p className={styles.sectionTitle}>Ringkasan Parameter Data Utama</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px',  }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>IHK Terakhir</span>
                <span style={{ fontSize: 16, color: '#fff', fontWeight: 600 }}>{ihkValue}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px',  }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Inflasi MoM</span>
                <span style={{ fontSize: 16, color: '#34B34A', fontWeight: 600 }}>{inflasiValue}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px',  }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Inflasi YoY</span>
                <span style={{ fontSize: 16, color: '#34B34A', fontWeight: 600 }}>{yoyValue}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px',  }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Komoditas Pendorong</span>
                <span style={{ fontSize: 15, color: '#fff', fontWeight: 600 }}>{pendorong}</span>
              </div>
            </div>

            {error && <p style={{ color: '#ef4444', marginTop: 16, fontSize: 14 }}>{error}</p>}

            {!savedHistoryId && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                <button
                  onClick={handleSaveAndGenerate}
                  disabled={generatingBRS || !aiSummary}
                  style={{
                    background: generatingBRS ? '#1f6a2c' : '#34B34A',
                    color: '#fff',
                    padding: '12px 28px',
                    borderRadius: '8px',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: generatingBRS ? 'not-allowed' : 'pointer',
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(52, 179, 74, 0.4)',
                    transition: 'transform 0.2s, background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: "100%",
                    justifyContent: "center"
                  }}
                >
                  {generatingBRS ? (
                    <>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }} />
                      Men-generate Laporan BRS...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Setujui & Generate Laporan BRS
                    </>
                  )}
                </button>
              </div>
            )}
          </Wrapper>

          {savedHistoryId && (
            <Wrapper style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 20px', textAlign: 'center', gap: '16px' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#34B34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p style={{ fontSize: 22, color: '#fff', fontWeight: 600, margin: 0 }}>
                  Dokumen BRS IDML Berhasil Digenerate!
                </p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0, maxWidth: '480px' }}>
                  Laporan Berita Resmi Statistik (BRS) untuk Kota {uploadedDataset?.context?.city} periode {uploadedDataset?.context?.period} telah berhasil diperbarui menggunakan data Anda dan disimpan di riwayat analisis.
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px' }}>
                  <button
                    onClick={handleDownloadIDML}
                    style={{
                      background: '#34B34A',
                      border: 'none',
                      color: '#fff',
                      padding: '12px 32px',
                      borderRadius: '8px',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(52, 179, 74, 0.4)',
                      transition: 'background 0.2s',
                      width: "100%",
                      justifyContent: "center"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#2da140'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#34B34A'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Unduh File IDML
                  </button>
                </div>
              </div>
            </Wrapper>
          )}
        </>
      )}
    </div>
  )
}