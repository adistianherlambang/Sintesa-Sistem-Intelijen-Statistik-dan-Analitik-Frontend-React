import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import styles from "./Analisis.module.css"
import { userStore } from "../../../logic/state/store"
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

// component
import Stepper from '../../../components/Stepper/Stepper'
import Wrapper from '../../../components/Wrapper/Wrapper'
import Hierarchy from '../../../components/Hierarchy/Hierarchy'
import MainButton from '../../../components/MainButton/MainButton'
import Input from '../../../components/Input/Input'
import Skeleton from '../../../components/Skeleton/Skeleton'
import AILoader from '../../../components/AILoader/AILoader'
import WordEditor from '../../../word/WordEditor'

const INDICATOR_OPTIONS = [
  { value: "komoditas", label: "Komoditas & Inflasi (IHK)" },
  { value: "pdrb-pengeluaran-adhk", label: "PDRB Pengeluaran ADHK (Harga Konstan)" },
  { value: "pdrb-pengeluaran-adhb", label: "PDRB Pengeluaran ADHB (Harga Berlaku)" },
  { value: "pdrb-lapangan-usaha-adhk", label: "PDRB Lapangan Usaha ADHK (Harga Konstan)" },
  { value: "pdrb-lapangan-usaha-adhb", label: "PDRB Lapangan Usaha ADHB (Harga Berlaku)" },
  { value: "demografi-penduduk", label: "Demografi Jumlah Penduduk Total" },
  { value: "demografi-laki", label: "Demografi Penduduk Laki-Laki" },
  { value: "demografi-perempuan", label: "Demografi Penduduk Perempuan" },
  { value: "demografi-kemiskinan", label: "Demografi Persentase Penduduk Miskin" },
]

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

export default function Analisis() {
  const [datasetSource, setDatasetSource] = useState("available") // "available" or "manual"
  const [selectedIndicators, setSelectedIndicators] = useState(["komoditas"])
  const [analysisTitle, setAnalysisTitle] = useState("Analisis BPS Kota Metro")
  const [uploadedDataset, setUploadedDataset] = useState(null)
  const [brsPreview, setBrsPreview] = useState(null)

  const item = datasetSource === "available" ? [
    {
      label: "Sumber Data",
      content: (props) => (
        <StepOne
          {...props}
          datasetSource={datasetSource}
          setDatasetSource={setDatasetSource}
        />
      )
    },
    {
      label: "Pilih Indikator",
      content: (props) => (
        <StepConfigAvailable
          {...props}
          selectedIndicators={selectedIndicators}
          setSelectedIndicators={setSelectedIndicators}
          analysisTitle={analysisTitle}
          setAnalysisTitle={setAnalysisTitle}
        />
      )
    },
    {
      label: "Edit Data BPS",
      content: (props) => (
        <StepTwoAvailable
          {...props}
          datasetSource={datasetSource}
          selectedIndicators={selectedIndicators}
          analysisTitle={analysisTitle}
          uploadedDataset={uploadedDataset}
          setUploadedDataset={setUploadedDataset}
        />
      )
    },
    {
      label: "Ringkasan & BRS",
      content: (props) => (
        <StepThree
          {...props}
          datasetSource={datasetSource}
          analysisTitle={analysisTitle}
          uploadedDataset={uploadedDataset}
          brsPreview={brsPreview}
          setBrsPreview={setBrsPreview}
        />
      )
    },
  ] : [
    {
      label: "Sumber Data",
      content: (props) => (
        <StepOne
          {...props}
          datasetSource={datasetSource}
          setDatasetSource={setDatasetSource}
        />
      )
    },
    {
      label: "Unggah Dataset",
      content: (props) => (
        <StepTwoManual
          {...props}
          datasetSource={datasetSource}
          uploadedDataset={uploadedDataset}
          setUploadedDataset={setUploadedDataset}
        />
      )
    },
    {
      label: "Ringkasan & BRS",
      content: (props) => (
        <StepThree
          {...props}
          datasetSource={datasetSource}
          analysisTitle={analysisTitle}
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

function StepConfigAvailable(props) {
  const { setStep, selectedIndicators, setSelectedIndicators, analysisTitle, setAnalysisTitle } = props

  const toggleIndicator = (val) => {
    if (selectedIndicators.includes(val)) {
      if (selectedIndicators.length === 1) return
      setSelectedIndicators(selectedIndicators.filter(item => item !== val))
    } else {
      setSelectedIndicators([...selectedIndicators, val])
    }
  }

  return (
    <div className={styles.container}>
      <Wrapper>
        <p className={styles.sectionTitle}>Konfigurasi Dataset & Indikator</p>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, margin: '0 0 20px 0' }}>
          Masukkan judul analisis dan pilih indikator dataset yang tersedia dari BPS (centang checkbox) untuk melanjutkan ke tahap edit data.
        </p>

        <div className={styles.configFormContainer}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Judul Analisis</label>
            <Input
              type="text"
              placeholder="Contoh: Analisis Perkembangan Inflasi & Komoditas Kota Metro"
              value={analysisTitle}
              setValue={setAnalysisTitle}
            />
            <span className={styles.formSubtext}>Judul ini akan digunakan pada laporan Berita Resmi Statistik (BRS).</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Pilih Indikator Dataset <span style={{ color: '#34B34A', fontSize: 12, marginLeft: 4 }}>({selectedIndicators.length} terpilih)</span>
            </label>
            <div className={styles.checkboxGrid}>
              {INDICATOR_OPTIONS.map((opt) => {
                const isChecked = selectedIndicators.includes(opt.value)
                return (
                  <div
                    key={opt.value}
                    className={`${styles.checkboxCard} ${isChecked ? styles.checkboxCardActive : ''}`}
                    onClick={() => toggleIndicator(opt.value)}
                  >
                    <div className={`${styles.checkboxBox} ${isChecked ? styles.checkboxBoxActive : ''}`}>
                      {isChecked && <span style={{ fontSize: 13, fontWeight: 'bold' }}>✓</span>}
                    </div>
                    <span className={styles.checkboxLabel}>{opt.label}</span>
                  </div>
                )
              })}
            </div>
            <span className={styles.formSubtext}>Centang satu atau lebih indikator yang ingin Anda analisis dan edit.</span>
          </div>

          <div style={{ marginTop: '12px' }}>
            <MainButton onClick={() => setStep(2)}>Lanjutkan</MainButton>
          </div>
        </div>
      </Wrapper>
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

function CustomForecastTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const isForecast = payload[0]?.payload?.isForecast;
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>
          Bulan: {label} {isForecast && <span style={{ color: '#34B34A', fontSize: 10, marginLeft: 4 }}>(Prediksi ANN)</span>}
        </p>
        {payload.map((entry, idx) => {
          const unit = entry.payload?.unit !== undefined ? entry.payload.unit : "%";
          return (
            <div key={idx} className={styles.tooltipItem}>
              <span style={{ color: entry.color, fontWeight: 600 }}>{entry.name}:</span>
              <span style={{ fontWeight: 'bold' }}>{Number(entry.value).toFixed(2)}{unit}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
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
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Nama File</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500, wordBreak: 'break-all' }}>{uploadedDataset.fileInfo.name}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Ukuran</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{uploadedDataset.fileInfo.size}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Dimensi (Rows x Cols)</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{uploadedDataset.fileInfo.rows} x {uploadedDataset.fileInfo.cols}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Sheet Terdeteksi</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{uploadedDataset.fileInfo.sheet}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Wilayah (Konteks)</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{uploadedDataset.context.city}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Periode</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{uploadedDataset.context.period}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Format Struktur</span>
                <span style={{ fontSize: 14, color: '#34B34A', fontWeight: 600 }}>{uploadedDataset.structure}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', }}>
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
  const { setStep, setUploadedDataset, datasetSource = "available", selectedIndicators = ["komoditas"], analysisTitle = "Analisis BPS Kota Metro" } = props
  const user = userStore((state) => state.user)

  const isCommodity = selectedIndicators.includes("komoditas")
  const nonCommodityIndicators = useMemo(() => {
    return selectedIndicators.filter(item => item !== "komoditas")
  }, [selectedIndicators])

  // Commodity & IHK state
  const [inflasiData, setInflasiData] = useState({ mom: null, yoy: null, ytd: null })
  const [ihkData, setIhkData] = useState(null)
  const [komoditasData, setKomoditasData] = useState({ mom: null, yoy: null, ytd: null })
  const [komoditasIhkData, setKomoditasIhkData] = useState(null)

  const [activeSheetIhk, setActiveSheetIhk] = useState("main") // "main" or commodity index string ("0", "1", ...)

  // Bobot komoditas state
  const [backendBobotMap, setBackendBobotMap] = useState({})
  const [commodityWeights, setCommodityWeights] = useState({})

  // Non-commodity indicators state map
  const [pdrbDemoMap, setPdrbDemoMap] = useState({})
  const [loadingPdrbDemo, setLoadingPdrbDemo] = useState(false)

  const [metricType, setMetricType] = useState("mom") // "mom", "yoy", "ytd"
  const [yearKomoditasInflasi, setYearKomoditasInflasi] = useState("now") // "now", "prev", "prev2"
  const [yearKomoditasIhk, setYearKomoditasIhk] = useState("now") // "now", "prev", "prev2"
  const [yearIhkUmum, setYearIhkUmum] = useState("now") // "now", "prev", "prev2"
  const [yearInflasiUmum, setYearInflasiUmum] = useState("now") // "now", "prev", "prev2"
  const [activeSheet, setActiveSheet] = useState("main") // "main" or commodity index string ("0", "1", ...)
  const [forecastingEnabled, setForecastingEnabled] = useState(false)
  const [annForecastResult, setAnnForecastResult] = useState(null)
  const [forecastActiveTab, setForecastActiveTab] = useState("inflasi-umum")

  const currentYear = new Date().getFullYear()
  const prevYear = currentYear - 1
  const prev2Year = currentYear - 2

  const activeInflasiObj = inflasiData[metricType]
  const activeDataInflasi = useMemo(() => {
    if (!activeInflasiObj) return []
    if (yearInflasiUmum === "now") return activeInflasiObj.data || []
    if (yearInflasiUmum === "prev") return activeInflasiObj.prevYear || []
    return activeInflasiObj.prev2Year || []
  }, [activeInflasiObj, yearInflasiUmum])

  const activeDataInflasiMoM = useMemo(() => {
    if (!inflasiData.mom) return []
    if (yearInflasiUmum === "now") return inflasiData.mom.data || []
    if (yearInflasiUmum === "prev") return inflasiData.mom.prevYear || []
    return inflasiData.mom.prev2Year || []
  }, [inflasiData.mom, yearInflasiUmum])

  const activeDataInflasiYoY = useMemo(() => {
    if (!inflasiData.yoy) return []
    if (yearInflasiUmum === "now") return inflasiData.yoy.data || []
    if (yearInflasiUmum === "prev") return inflasiData.yoy.prevYear || []
    return inflasiData.yoy.prev2Year || []
  }, [inflasiData.yoy, yearInflasiUmum])

  const activeDataInflasiYtd = useMemo(() => {
    if (!inflasiData.ytd) return []
    if (yearInflasiUmum === "now") return inflasiData.ytd.data || []
    if (yearInflasiUmum === "prev") return inflasiData.ytd.prevYear || []
    return inflasiData.ytd.prev2Year || []
  }, [inflasiData.ytd, yearInflasiUmum])

  const activeDataIhk = useMemo(() => {
    if (!ihkData) return []
    if (yearIhkUmum === "now") return ihkData.data || []
    if (yearIhkUmum === "prev") return ihkData.prevYear || []
    return ihkData.prev2Year || []
  }, [ihkData, yearIhkUmum])

  const activeKomoditasObj = komoditasData[metricType]
  const komoditasList = useMemo(() => {
    if (!activeKomoditasObj) return []
    if (yearKomoditasInflasi === "now") return activeKomoditasObj.hierarki || []
    if (yearKomoditasInflasi === "prev") return activeKomoditasObj.prevYear || activeKomoditasObj.prevYearList || []
    return activeKomoditasObj.prev2Year || activeKomoditasObj.prev2YearList || []
  }, [activeKomoditasObj, yearKomoditasInflasi])

  const komoditasIhkList = useMemo(() => {
    if (!komoditasIhkData) return []
    if (yearKomoditasIhk === "now") return komoditasIhkData.hierarki || []
    if (yearKomoditasIhk === "prev") return komoditasIhkData.prevYear || komoditasIhkData.prevYearList || []
    return komoditasIhkData.prev2Year || komoditasIhkData.prev2YearList || []
  }, [komoditasIhkData, yearKomoditasIhk])

  const activeCommodityIhkIndex = activeSheetIhk !== "main" ? Number(activeSheetIhk) : null
  const activeCommodityIhk = activeCommodityIhkIndex !== null ? komoditasIhkList[activeCommodityIhkIndex] : null
  const subIhkList = activeCommodityIhk?.sub || []

  const userCityName = useMemo(() => {
    return activeInflasiObj?.kota || user?.location?.name || ""
  }, [activeInflasiObj, user])

  useEffect(() => {
    if (nonCommodityIndicators.length === 0) return

    const fetchOtherIndicators = async () => {
      setLoadingPdrbDemo(true)
      try {
        const userCity = user?.location?.name || "KOTA METRO"
        const newMap = {}

        await Promise.all(nonCommodityIndicators.map(async (key) => {
          let endpoint = ""
          if (key === "pdrb-pengeluaran-adhk") endpoint = `${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/pdrb/pengeluaran-adhk`
          else if (key === "pdrb-pengeluaran-adhb") endpoint = `${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/pdrb/pengeluaran-adhb`
          else if (key === "pdrb-lapangan-usaha-adhk") endpoint = `${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/pdrb/lapangan-usaha-adhk`
          else if (key === "pdrb-lapangan-usaha-adhb") endpoint = `${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/pdrb/lapangan-usaha-adhb`
          else if (key === "demografi-penduduk") endpoint = `${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/demografi/penduduk`
          else if (key === "demografi-laki") endpoint = `${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/demografi/penduduk-laki-laki`
          else if (key === "demografi-perempuan") endpoint = `${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/demografi/penduduk-perempuan`
          else if (key === "demografi-kemiskinan") endpoint = `${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/demografi/kemiskinan`

          if (endpoint) {
            const res = await axios.post(endpoint, { kota: userCity })
            newMap[key] = res.data
          }
        }))

        setPdrbDemoMap(newMap)
      } catch (err) {
        console.error("Gagal memuat data indikator:", err.message)
      } finally {
        setLoadingPdrbDemo(false)
      }
    }
    fetchOtherIndicators()
  }, [nonCommodityIndicators, user])

  const handlePdrbDemoValueChange = (indicatorKey, idx, val) => {
    setPdrbDemoMap(prev => {
      const targetObj = prev[indicatorKey]
      if (!targetObj || !targetObj.data) return prev
      const newList = [...targetObj.data]
      newList[idx] = { ...newList[idx], value: val }
      return {
        ...prev,
        [indicatorKey]: {
          ...targetObj,
          data: newList
        }
      }
    })
  }

  const monthNames = MONTH_NAMES;

  const getCommodityMonthVal = (commodityData, monthIdx) => {
    if (!commodityData || typeof commodityData !== "object") return "";
    const mName = monthNames[monthIdx];
    if (commodityData[mName] !== undefined && commodityData[mName] !== "") {
      return String(commodityData[mName]);
    }
    if (commodityData[String(monthIdx)] !== undefined && commodityData[String(monthIdx)] !== "") {
      return String(commodityData[String(monthIdx)]);
    }
    if (commodityData[String(monthIdx + 1)] !== undefined && commodityData[String(monthIdx + 1)] !== "") {
      return String(commodityData[String(monthIdx + 1)]);
    }
    const keys = Object.keys(commodityData);
    const month2Digits = String(monthIdx + 1).padStart(2, "0");
    const matchedKey = keys.find(k => k.endsWith(month2Digits) || k.endsWith(String(monthIdx + 1)));
    if (matchedKey && commodityData[matchedKey] !== undefined && commodityData[matchedKey] !== "") {
      return String(commodityData[matchedKey]);
    }
    if (keys[monthIdx] !== undefined && commodityData[keys[monthIdx]] !== undefined && commodityData[keys[monthIdx]] !== "") {
      return String(commodityData[keys[monthIdx]]);
    }
    return "";
  };

  const setCommodityMonthVal = (commodityData, monthIdx, val) => {
    const nextData = { ...(commodityData || {}) };
    const keys = Object.keys(nextData);
    const mName = monthNames[monthIdx];
    const month2Digits = String(monthIdx + 1).padStart(2, "0");
    const matchedKey = keys.find(k => k.endsWith(month2Digits) || k.endsWith(String(monthIdx + 1)));
    const keyToUse = matchedKey || (keys[monthIdx] !== undefined ? keys[monthIdx] : mName);
    nextData[keyToUse] = val;
    return nextData;
  };

  // Otomatis cari bulan terakhir yang memiliki data riil di tabel (bukan bulan sekarang)
  const latestDataMonthIndex = useMemo(() => {
    const isValidVal = (v) => v !== undefined && v !== null && String(v).trim() !== "" && String(v).trim() !== "0" && String(v).trim() !== "0.00";
    for (let i = 11; i >= 0; i--) {
      const mom = activeDataInflasiMoM?.[i]?.value;
      const yoy = activeDataInflasiYoY?.[i]?.value;
      const ytd = activeDataInflasiYtd?.[i]?.value;
      const ihk = activeDataIhk?.[i]?.value;
      if (isValidVal(mom) || isValidVal(yoy) || isValidVal(ytd) || (ihk !== undefined && ihk !== null && String(ihk).trim() !== "")) {
        return i;
      }
      const hasComm = (komoditasList || []).some(c => isValidVal(getCommodityMonthVal(c?.data, i)));
      if (hasComm) return i;
    }
    return 0; // Default ke Januari jika seluruh bulan kosong
  }, [activeDataInflasiMoM, activeDataInflasiYoY, activeDataInflasiYtd, activeDataIhk, komoditasList]);

  const selectedMonthIndex = latestDataMonthIndex;

  const handleSave = () => {
    const nextStepIndex = datasetSource === "available" ? 3 : 2;
    const combinedParsedData = [];

    const monthIndex = latestDataMonthIndex;
    const targetYear = yearInflasiUmum === "now" ? currentYear : yearInflasiUmum === "prev" ? prevYear : prev2Year;
    const targetMonthName = monthNames[monthIndex];

    if (isCommodity) {
      const infValue = activeDataInflasiMoM?.[monthIndex]?.value !== undefined && activeDataInflasiMoM[monthIndex].value !== ""
        ? String(activeDataInflasiMoM[monthIndex].value)
        : "0.00";
      const yValue = activeDataInflasiYoY?.[monthIndex]?.value !== undefined && activeDataInflasiYoY[monthIndex].value !== ""
        ? String(activeDataInflasiYoY[monthIndex].value)
        : "0.00";
      const ytdValue = activeDataInflasiYtd?.[monthIndex]?.value !== undefined && activeDataInflasiYtd[monthIndex].value !== ""
        ? String(activeDataInflasiYtd[monthIndex].value)
        : "0.00";
      const iValue = activeDataIhk?.[monthIndex]?.value !== undefined && activeDataIhk[monthIndex].value !== ""
        ? String(activeDataIhk[monthIndex].value)
        : "100.00";
      const prevIhkValue = (monthIndex > 0 && activeDataIhk?.[monthIndex - 1]?.value !== undefined && activeDataIhk[monthIndex - 1].value !== "")
        ? String(activeDataIhk[monthIndex - 1].value)
        : iValue;

      const norm = (s) => String(s || "").toLowerCase().replace(/,/g, "").replace(/\s+/g, " ").trim();

      const divisions = komoditasList.map(c => {
        const wVal = commodityWeights[c.label] !== undefined ? commodityWeights[c.label] : (100 / (komoditasList.length || 11)).toFixed(2);

        // MoM value from c.data (which was updated by handleKomoditasChange)
        const mtmVal = getCommodityMonthVal(c.data, monthIndex) || "0.00";
        const mtmInf = parseFloat(mtmVal) || 0;

        // Match IHK
        const matchedIhk = (komoditasIhkList || []).find(item => norm(item.label) === norm(c.label) || norm(item.label).includes(norm(c.label)) || norm(c.label).includes(norm(item.label)));
        const ihkVal = getCommodityMonthVal(matchedIhk?.data, monthIndex) || "100.00";
        const prevIhkVal = monthIndex > 0 ? (getCommodityMonthVal(matchedIhk?.data, monthIndex - 1) || ihkVal) : ihkVal;

        // Match YoY
        const matchedYoy = (komoditasData.yoy?.hierarki || []).find(item => norm(item.label) === norm(c.label) || norm(item.label).includes(norm(c.label)) || norm(c.label).includes(norm(item.label)));
        const yoyVal = getCommodityMonthVal(matchedYoy?.data, monthIndex) || "0.00";

        // Match YtD
        const matchedYtd = (komoditasData.ytd?.hierarki || []).find(item => norm(item.label) === norm(c.label) || norm(item.label).includes(norm(c.label)) || norm(c.label).includes(norm(item.label)));
        const ytdVal = getCommodityMonthVal(matchedYtd?.data, monthIndex) || "0.00";

        const andilMtm = ((parseFloat(wVal) * mtmInf) / 100).toFixed(2);
        const andilYoy = ((parseFloat(wVal) * (parseFloat(yoyVal) || 0)) / 100).toFixed(2);

        return {
          name: c.label,
          weight: wVal,
          ihkLalu: prevIhkVal,
          ihk: ihkVal,
          inflasi: mtmVal,
          ytd: ytdVal,
          yoy: yoyVal,
          andil: andilMtm,
          andilYoy: andilYoy
        };
      });

      combinedParsedData.push(
        ["Tahun", "Bulan", "Kode Kota", "Nama Kota", "Kode Komoditas", "Nama Komoditas", "Timbangan", "IHK Lalu", "IHK", "Inflasi", "Inflasi YtD", "Inflasi YoY", "Andil"],
        [targetYear, monthIndex + 1, "1872", userCityName, "0", "UMUM", "100", prevIhkValue, iValue, infValue, ytdValue, yValue, infValue]
      );

      divisions.forEach((div, idx) => {
        const code = String(idx + 1).padStart(2, "0");
        combinedParsedData.push([
          targetYear,
          monthIndex + 1,
          "1872",
          userCityName,
          code,
          div.name,
          String(div.weight),
          String(div.ihkLalu),
          String(div.ihk),
          String(div.inflasi),
          String(div.ytd),
          String(div.yoy),
          String(div.andil)
        ]);
      });
    }

    nonCommodityIndicators.forEach((key) => {
      const itemData = pdrbDemoMap[key];
      if (itemData && itemData.data) {
        const varLabel = itemData?.var?.label || key;
        const cityName = itemData?.kota || userCityName || "KOTA METRO";

        if (combinedParsedData.length === 0) {
          combinedParsedData.push(["Tahun", "Bulan", "Kode Kota", "Nama Kota", "Kode Komoditas", "Nama Komoditas", "Timbangan", "IHK Lalu", "IHK", "Inflasi", "Inflasi YtD", "Inflasi YoY", "Andil"]);
        }

        itemData.data.forEach((row, rIdx) => {
          combinedParsedData.push([
            targetYear,
            selectedMonthIndex + 1,
            "1872",
            cityName,
            String(rIdx + 1),
            `${varLabel} - ${row.turvarLabel || "Utama"}`,
            "10",
            "10",
            "100",
            String(row.value !== undefined && row.value !== null ? row.value : 0),
            "0",
            "0",
            String(row.value !== undefined && row.value !== null ? row.value : 0)
          ]);
        });
      }
    });

    if (combinedParsedData.length === 0) {
      combinedParsedData.push(
        ["Tahun", "Bulan", "Kode Kota", "Nama Kota", "Kode Komoditas", "Nama Komoditas", "Timbangan", "IHK Lalu", "IHK", "Inflasi", "Inflasi YtD", "Inflasi YoY", "Andil"],
        [targetYear, selectedMonthIndex + 1, "1872", userCityName || "KOTA METRO", "0", "UMUM", "100", "100", "100", "0", "0", "0", "0"]
      );
    }

    setUploadedDataset({
      valid: "ya",
      fileInfo: {
        name: `Database BPS (${selectedIndicators.join(", ")})`,
        size: "N/A",
        rows: combinedParsedData.length,
        cols: combinedParsedData[0]?.length || 13,
        sheet: "Sheet Utama"
      },
      context: {
        city: userCityName || user?.location?.name || "KOTA METRO",
        period: `${targetMonthName} ${targetYear}`,
        monthIndex: selectedMonthIndex,
        year: targetYear,
        title: analysisTitle
      },
      structure: "BPS Multi-Indikator",
      columns: combinedParsedData[0],
      parsedData: combinedParsedData,
      editedData: { inflasiData, ihkData, komoditasData, komoditasIhkData, pdrbDemoMap, forecast: annForecastResult?.forecast || null }
    });

    setStep(nextStepIndex);
  };



  const komoditasLabelsKey = useMemo(() => {
    if (!komoditasList) return "";
    return komoditasList.map(c => {
      const biKey = (c.hargaBI || []).map(b => (typeof b === 'string' ? b : b?.name || b?.label || '')).join(",");
      return `${c.label}:${(c.sub || []).map(s => s.label).join(",")}:bi[${biKey}]`;
    }).join("|");
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

    const fallbackHargaBI = komoditasData.mom?.hierarki?.find(
      item => item.label && item.label.toLowerCase().includes("makanan")
    )?.hargaBI || []

    komoditasList.forEach(c => {
      const cLabel = c.label
      const cChildren = {}
      if (c.sub && Array.isArray(c.sub)) {
        c.sub.forEach(subItem => {
          const subChildren = {}
          const hargaBIList = (c.hargaBI && c.hargaBI.length > 0)
            ? c.hargaBI
            : (cLabel.toLowerCase().includes("makanan") ? fallbackHargaBI : [])

          if (
            hargaBIList &&
            Array.isArray(hargaBIList) &&
            hargaBIList.length > 0 &&
            subItem.label === "Makanan"
          ) {
            hargaBIList.forEach(biItem => {
              const biName = typeof biItem === 'string' ? biItem : (biItem?.name || biItem?.label || '');
              if (biName) {
                subChildren[biName] = {}
              }
            })
          }
          cChildren[subItem.label] = subChildren
        })
      }
      rootChildren[cLabel] = cChildren
    })

    return {
      [rootLabel]: rootChildren
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [komoditasLabelsKey, komoditasData])

  useEffect(() => {
    if (!isCommodity) return

    const fetchData = async () => {
      try {
        const userCity = user?.location?.name || ""
        const normalizeGroupName = (str) => {
          if (!str) return ""
          return str.toLowerCase().replace(/,/g, "").replace(/\s+/g, " ").trim()
        }

        const res = await axios
          .post(`${process.env.REACT_APP_URL_SERVER}/api/analisis/inflasi-ihk`, { kota: userCity })
          .catch(() => ({ data: null }))

        if (res?.data) {
          const d = res.data
          setInflasiData({
            mom: d.inflasi?.mom || null,
            yoy: d.inflasi?.yoy || null,
            ytd: d.inflasi?.ytd || null,
          })
          setIhkData(d.ihk || null)
          setKomoditasData({
            mom: d.komoditasInflasi?.mom || d.komoditas?.mom || null,
            yoy: d.komoditasInflasi?.yoy || d.komoditas?.yoy || null,
            ytd: d.komoditasInflasi?.ytd || d.komoditas?.ytd || null,
          })
          setKomoditasIhkData(d.komoditasIHK || d.komoditasIhk || null)
          if (d.forecast) {
            setAnnForecastResult(d.forecast)
          }
          const bobotList = Array.isArray(d.bobot) ? d.bobot : d.bobot?.bobot
          if (bobotList && Array.isArray(bobotList)) {
            const map = {}
            bobotList.forEach((item) => {
              map[normalizeGroupName(item.kelompok)] = String(item.bobot)
            })
            setBackendBobotMap(map)
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data inflasi & IHK:", err.message)
      }
    }
    fetchData()
  }, [user, isCommodity])

  const normalizeGroupName = (str) => {
    if (!str) return ""
    return str.toLowerCase().replace(/,/g, "").replace(/\s+/g, " ").trim()
  }

  useEffect(() => {
    if (komoditasList && komoditasList.length > 0) {
      setCommodityWeights(prev => {
        const nextWeights = { ...prev }
        komoditasList.forEach((c) => {
          if (nextWeights[c.label] === undefined) {
            const normKey = normalizeGroupName(c.label)
            if (backendBobotMap[normKey] !== undefined) {
              nextWeights[c.label] = backendBobotMap[normKey]
            } else {
              nextWeights[c.label] = (100 / komoditasList.length).toFixed(2)
            }
          }
        })
        return nextWeights
      })
    }
  }, [komoditasList, backendBobotMap])

  const handleWeightChange = (label, val) => {
    setCommodityWeights(prev => ({
      ...prev,
      [label]: val
    }))
  }

  const totalWeight = useMemo(() => {
    if (!komoditasList || komoditasList.length === 0) return "0.00"
    const sum = komoditasList.reduce((acc, c) => {
      const w = parseFloat(commodityWeights[c.label]) || 0
      return acc + w
    }, 0)
    return sum.toFixed(2)
  }, [komoditasList, commodityWeights])

  const handleInflasiMetricChange = (metricName, index, val) => {
    setInflasiData(prev => {
      const targetObj = prev[metricName]
      if (!targetObj) return prev
      const targetField = yearInflasiUmum === "now" ? "data" : yearInflasiUmum === "prev" ? "prevYear" : "prev2Year"
      const rawList = targetObj[targetField] || []
      const newList = [...rawList]
      while (newList.length <= index) {
        newList.push({ value: "" })
      }
      newList[index] = { ...newList[index], value: val }
      return {
        ...prev,
        [metricName]: {
          ...targetObj,
          [targetField]: newList,
        }
      }
    })
  }

  const handleInflasiChange = (index, val) => {
    handleInflasiMetricChange(metricType, index, val)
  }

  const handleIhkChange = (index, val) => {
    setIhkData(prev => {
      if (!prev) return prev
      const targetField = yearIhkUmum === "now" ? "data" : yearIhkUmum === "prev" ? "prevYear" : "prev2Year"
      const rawList = prev[targetField] || []
      const newList = [...rawList]
      while (newList.length <= index) {
        newList.push({ value: "" })
      }
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
      const targetField = yearKomoditasInflasi === "now" ? "hierarki" : yearKomoditasInflasi === "prev" ? (targetObj.prevYear ? "prevYear" : "prevYearList") : (targetObj.prev2Year ? "prev2Year" : "prev2YearList")
      const newList = [...(targetObj[targetField] || [])]
      const targetCommodity = { ...newList[commodityIndex] }

      targetCommodity.data = setCommodityMonthVal(targetCommodity.data, monthIndex, val)

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
      const targetField = yearKomoditasInflasi === "now" ? "hierarki" : yearKomoditasInflasi === "prev" ? (targetObj.prevYear ? "prevYear" : "prevYearList") : (targetObj.prev2Year ? "prev2Year" : "prev2YearList")
      const newList = [...(targetObj[targetField] || [])]
      const targetCommodity = { ...newList[commodityIndex] }

      const newSubs = [...(targetCommodity.sub || [])]
      const targetSub = { ...newSubs[subIndex] }

      targetSub.data = setCommodityMonthVal(targetSub.data, monthIndex, val)

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

  const handleKomoditasIhkChange = (commodityIndex, monthIndex, val) => {
    setKomoditasIhkData(prev => {
      if (!prev) return prev
      const targetField = yearKomoditasIhk === "now" ? "hierarki" : yearKomoditasIhk === "prev" ? (prev.prevYear ? "prevYear" : "prevYearList") : (prev.prev2Year ? "prev2Year" : "prev2YearList")
      const newList = [...(prev[targetField] || [])]
      const targetCommodity = { ...newList[commodityIndex] }

      targetCommodity.data = setCommodityMonthVal(targetCommodity.data, monthIndex, val)

      newList[commodityIndex] = targetCommodity
      return {
        ...prev,
        [targetField]: newList,
      }
    })
  }

  const handleSubKomoditasIhkChange = (commodityIndex, subIndex, monthIndex, val) => {
    setKomoditasIhkData(prev => {
      if (!prev) return prev
      const targetField = yearKomoditasIhk === "now" ? "hierarki" : yearKomoditasIhk === "prev" ? (prev.prevYear ? "prevYear" : "prevYearList") : (prev.prev2Year ? "prev2Year" : "prev2YearList")
      const newList = [...(prev[targetField] || [])]
      const targetCommodity = { ...newList[commodityIndex] }

      const newSubs = [...(targetCommodity.sub || [])]
      const targetSub = { ...newSubs[subIndex] }

      targetSub.data = setCommodityMonthVal(targetSub.data, monthIndex, val)

      newSubs[subIndex] = targetSub
      targetCommodity.sub = newSubs
      newList[commodityIndex] = targetCommodity

      return {
        ...prev,
        [targetField]: newList,
      }
    })
  }

  const dynamicForecastTabs = useMemo(() => {
    const tabs = [];
    if (isCommodity) {
      tabs.push({ id: "inflasi-umum", label: "Inflasi Umum (MoM / YoY / YtD)", category: "commodity" });
      tabs.push({ id: "ihk-umum", label: "IHK Umum", category: "commodity" });
      tabs.push({ id: "komoditas", label: "11 Kelompok Komoditas", category: "commodity" });
    }
    nonCommodityIndicators.forEach(key => {
      const opt = INDICATOR_OPTIONS.find(o => o.value === key);
      tabs.push({
        id: key,
        label: opt ? opt.label : key,
        category: "non-commodity"
      });
    });
    return tabs;
  }, [isCommodity, nonCommodityIndicators]);

  useEffect(() => {
    if (dynamicForecastTabs.length > 0 && !dynamicForecastTabs.some(t => t.id === forecastActiveTab)) {
      setForecastActiveTab(dynamicForecastTabs[0].id);
    }
  }, [dynamicForecastTabs, forecastActiveTab]);

  const forecastChartData = useMemo(() => {
    if (!activeDataInflasiMoM || activeDataInflasiMoM.length === 0) return [];

    const monthShortNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    const momValues = monthNames.map((_, i) => {
      const item = activeDataInflasiMoM[i];
      const v = item ? parseFloat(item.value) : NaN;
      return isNaN(v) ? null : v;
    });
    const yoyValues = monthNames.map((_, i) => {
      const item = activeDataInflasiYoY[i];
      const v = item ? parseFloat(item.value) : NaN;
      return isNaN(v) ? null : v;
    });
    const ytdValues = monthNames.map((_, i) => {
      const item = activeDataInflasiYtd[i];
      const v = item ? parseFloat(item.value) : NaN;
      return isNaN(v) ? null : v;
    });

    let lastValidIdx = 0;
    for (let i = 11; i >= 0; i--) {
      if (momValues[i] !== null) {
        lastValidIdx = i;
        break;
      }
    }

    // Directly read commodity values from user-edited komoditas table
    let commodityImpact = 0;
    if (komoditasList && komoditasList.length > 0) {
      const comVals = komoditasList.map(c => {
        const raw = getCommodityMonthVal(c.data, lastValidIdx);
        const num = parseFloat(raw);
        return isNaN(num) ? 0 : num;
      });
      commodityImpact = comVals.reduce((acc, v) => acc + v, 0) / (comVals.length || 1);
    }

    const points = [];
    for (let i = 0; i <= lastValidIdx; i++) {
      if (momValues[i] !== null || yoyValues[i] !== null || ytdValues[i] !== null) {
        points.push({
          label: monthShortNames[i % 12],
          isForecast: false,
          mom: parseFloat(((momValues[i] !== null ? momValues[i] : 0)).toFixed(2)),
          yoy: parseFloat(((yoyValues[i] !== null ? yoyValues[i] : 0)).toFixed(2)),
          ytd: parseFloat(((ytdValues[i] !== null ? ytdValues[i] : 0)).toFixed(2))
        });
      }
    }

    const validMom = momValues.filter(v => v !== null);
    const lastMom = validMom.length > 0 ? validMom[validMom.length - 1] : 0;
    const maxMom = validMom.length > 0 ? Math.max(...validMom) : 0;
    const minMom = validMom.length > 0 ? Math.min(...validMom) : 0;
    const hasSimulatedMom = Math.abs(maxMom) > 50 || Math.abs(minMom) > 50;
    const anchorMom = hasSimulatedMom ? (Math.abs(maxMom) > 50 ? maxMom : minMom) : lastMom;

    const validYoy = yoyValues.filter(v => v !== null);
    const lastYoy = validYoy.length > 0 ? validYoy[validYoy.length - 1] : 0;

    const validYtd = ytdValues.filter(v => v !== null);
    let runningYtd = validYtd.length > 0 ? validYtd[validYtd.length - 1] : 0;

    const last3Mom = validMom.slice(-3);
    const trendMom = last3Mom.length > 1 ? (last3Mom[last3Mom.length - 1] - last3Mom[0]) / (last3Mom.length - 1) : 0;

    const baseMom = anchorMom !== 0 ? anchorMom : (commodityImpact !== 0 ? commodityImpact : 0);

    let currentYoy = lastYoy;

    for (let step = 1; step <= 3; step++) {
      const nextMonthIdx = (lastValidIdx + step) % 12;
      const monthLabel = `${monthShortNames[nextMonthIdx]} (T+${step})`;

      let predMom;
      if (hasSimulatedMom) {
        predMom = parseFloat((baseMom + (trendMom * 0.2) + (commodityImpact * 0.1)).toFixed(2));
      } else {
        const userPredMom = baseMom + (trendMom * 0.45) + (commodityImpact * 0.15);
        if (Array.isArray(annForecastResult?.forecast?.inflasi) && annForecastResult.forecast.inflasi[step - 1] !== undefined) {
          const annVal = Number(annForecastResult.forecast.inflasi[step - 1]);
          predMom = parseFloat((0.75 * userPredMom + 0.25 * annVal).toFixed(2));
        } else {
          predMom = parseFloat(userPredMom.toFixed(2));
        }
      }

      currentYoy = parseFloat((currentYoy * 0.85 + predMom * 0.4).toFixed(2));
      runningYtd = nextMonthIdx === 0 ? predMom : parseFloat((runningYtd + predMom).toFixed(2));

      points.push({
        label: monthLabel,
        isForecast: true,
        mom: predMom,
        yoy: currentYoy,
        ytd: runningYtd
      });
    }

    return points;
  }, [activeDataInflasiMoM, activeDataInflasiYoY, activeDataInflasiYtd, komoditasList, annForecastResult]);

  const forecastIhkChartData = useMemo(() => {
    if (!activeDataIhk || activeDataIhk.length === 0) return [];

    const monthShortNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    const ihkVals = monthNames.map((_, i) => {
      const item = activeDataIhk[i];
      const v = item ? parseFloat(item.value) : NaN;
      return isNaN(v) ? null : v;
    });

    let lastValidIdx = 0;
    for (let i = 11; i >= 0; i--) {
      if (ihkVals[i] !== null) {
        lastValidIdx = i;
        break;
      }
    }

    const points = [];
    for (let i = 0; i <= lastValidIdx; i++) {
      if (ihkVals[i] !== null) {
        points.push({
          label: monthShortNames[i % 12],
          isForecast: false,
          ihk: parseFloat(ihkVals[i].toFixed(2)),
          unit: ""
        });
      }
    }

    const validIhk = ihkVals.filter(v => v !== null && v > 0);
    const lastIhk = validIhk.length > 0 ? validIhk[validIhk.length - 1] : 100;
    const maxIhk = validIhk.length > 0 ? Math.max(...validIhk) : 100;
    const anchorIhk = maxIhk > 250 ? maxIhk : lastIhk;

    let currentIhk = anchorIhk;
    for (let step = 1; step <= 3; step++) {
      const nextMonthIdx = (lastValidIdx + step) % 12;
      const monthLabel = `${monthShortNames[nextMonthIdx]} (T+${step})`;

      const momStep = forecastChartData.filter(d => d.isForecast)[step - 1]?.mom || 0.25;
      currentIhk = currentIhk * (1 + momStep / 100);
      const predIhk = parseFloat(currentIhk.toFixed(2));

      points.push({
        label: monthLabel,
        isForecast: true,
        ihk: predIhk,
        unit: ""
      });
    }

    return points;
  }, [activeDataIhk, forecastChartData, annForecastResult]);

  const forecastKomoditasList = useMemo(() => {
    if (!komoditasList || komoditasList.length === 0) return [];

    const monthShortNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    let lastValidIdx = 0;
    for (let i = 11; i >= 0; i--) {
      if (activeDataInflasiMoM[i] && activeDataInflasiMoM[i].value !== undefined && activeDataInflasiMoM[i].value !== "") {
        lastValidIdx = i;
        break;
      }
    }
    const t1Label = monthShortNames[(lastValidIdx + 1) % 12];
    const t2Label = monthShortNames[(lastValidIdx + 2) % 12];
    const t3Label = monthShortNames[(lastValidIdx + 3) % 12];

    const annKomoditas = annForecastResult?.forecast?.komoditas || {};
    const cleanStr = str => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    return komoditasList.map(c => {
      let t1 = 0, t2 = 0, t3 = 0;
      const cClean = cleanStr(c.label);

      // Extract all 12 monthly values using our reliable helper
      const monthlyVals = monthNames.map((_, mIdx) => {
        const raw = getCommodityMonthVal(c.data, mIdx);
        const num = parseFloat(raw);
        return isNaN(num) ? null : num;
      });

      const validVals = monthlyVals.filter(v => v !== null);
      const lastVal = validVals.length > 0 ? validVals[validVals.length - 1] : (parseFloat(c.value) || 0);
      const maxVal = validVals.length > 0 ? Math.max(...validVals) : 0;
      const minVal = validVals.length > 0 ? Math.min(...validVals) : 0;
      
      const hasSimulatedLarge = maxVal > 50;
      const hasSimulatedSmall = minVal < -50;
      const anchorVal = hasSimulatedLarge ? maxVal : (hasSimulatedSmall ? minVal : lastVal);

      const last3 = validVals.slice(-3);
      const trend = last3.length > 1 ? (last3[last3.length - 1] - last3[0]) / (last3.length - 1) : 0;

      const userPred1 = anchorVal + (trend * 0.45);
      const userPred2 = userPred1 + (trend * 0.30);
      const userPred3 = userPred2 + (trend * 0.20);

      const matchedKey = Object.keys(annKomoditas).find(k => {
        const kClean = cleanStr(k);
        return kClean === cClean || kClean.includes(cClean) || cClean.includes(kClean);
      });

      if (matchedKey && Array.isArray(annKomoditas[matchedKey]) && !hasSimulatedLarge && !hasSimulatedSmall) {
        const arr = annKomoditas[matchedKey];
        t1 = parseFloat((0.80 * userPred1 + 0.20 * Number(arr[0] || 0)).toFixed(2));
        t2 = parseFloat((0.80 * userPred2 + 0.20 * Number(arr[1] || 0)).toFixed(2));
        t3 = parseFloat((0.80 * userPred3 + 0.20 * Number(arr[2] || 0)).toFixed(2));
      } else {
        t1 = parseFloat(userPred1.toFixed(2));
        t2 = parseFloat(userPred2.toFixed(2));
        t3 = parseFloat(userPred3.toFixed(2));
      }

      return {
        name: c.label,
        t1,
        t2,
        t3,
        t1Label,
        t2Label,
        t3Label,
        status: t1 >= 0 ? "Inflasi" : "Deflasi"
      };
    });
  }, [komoditasList, activeDataInflasiMoM, annForecastResult]);

  const forecastKomoditasIhkList = useMemo(() => {
    if (!komoditasIhkList || komoditasIhkList.length === 0) return [];

    const monthShortNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    let lastValidIdx = 0;
    for (let i = 11; i >= 0; i--) {
      if (activeDataIhk[i] && activeDataIhk[i].value !== undefined && activeDataIhk[i].value !== "") {
        lastValidIdx = i;
        break;
      }
    }
    const t1Label = monthShortNames[(lastValidIdx + 1) % 12];
    const t2Label = monthShortNames[(lastValidIdx + 2) % 12];
    const t3Label = monthShortNames[(lastValidIdx + 3) % 12];

    const cleanStr = str => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    return komoditasIhkList.map((item) => {
      const monthlyVals = monthNames.map((_, mIdx) => {
        const raw = getCommodityMonthVal(item.data, mIdx);
        const num = parseFloat(raw);
        return isNaN(num) ? null : num;
      });

      const validVals = monthlyVals.filter(v => v !== null && v > 0);
      const lastIhkVal = validVals.length > 0 ? validVals[validVals.length - 1] : (parseFloat(item.value) || 100);
      const maxIhkVal = validVals.length > 0 ? Math.max(...validVals) : 100;
      const anchorIhk = maxIhkVal > 250 ? maxIhkVal : lastIhkVal;

      const matchedInflasi = forecastKomoditasList.find(c => cleanStr(c.name) === cleanStr(item.label));
      const t1Mom = matchedInflasi ? matchedInflasi.t1 : 0.2;
      const t2Mom = matchedInflasi ? matchedInflasi.t2 : 0.2;
      const t3Mom = matchedInflasi ? matchedInflasi.t3 : 0.2;

      const t1Ihk = parseFloat((anchorIhk * (1 + t1Mom / 100)).toFixed(2));
      const t2Ihk = parseFloat((t1Ihk * (1 + t2Mom / 100)).toFixed(2));
      const t3Ihk = parseFloat((t2Ihk * (1 + t3Mom / 100)).toFixed(2));

      return {
        name: item.label,
        lastIhk: anchorIhk.toFixed(2),
        t1Ihk,
        t2Ihk,
        t3Ihk,
        t1Label,
        t2Label,
        t3Label
      };
    });
  }, [komoditasIhkList, activeDataIhk, forecastKomoditasList]);

  const forecastNonCommodityData = useMemo(() => {
    const result = {};
    nonCommodityIndicators.forEach(key => {
      const itemData = pdrbDemoMap[key];
      if (!itemData || !itemData.data) return;

      const rows = itemData.data.map(row => {
        const val = parseFloat(row.value) || 0;
        const isDemografi = key.includes("demografi");
        const growthRate = isDemografi ? 0.012 : 0.035;
        const predNext = parseFloat((val * (1 + growthRate)).toFixed(2));
        const predNext2 = parseFloat((val * (1 + growthRate * 2)).toFixed(2));

        return {
          turvarLabel: row.turvarLabel || (row.turvarVal ? `Kategori ${row.turvarVal}` : "Utama"),
          currentVal: val,
          predNext,
          predNext2,
          growthRate: (growthRate * 100).toFixed(1)
        };
      });

      result[key] = {
        label: itemData?.var?.label || key,
        data: rows
      };
    });
    return result;
  }, [nonCommodityIndicators, pdrbDemoMap]);

  function capitalize(str) {
    if (!str) return ""
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  const isCommodityLoading = isCommodity && (!inflasiData.mom || !ihkData || !komoditasData.mom || !komoditasIhkData)
  const isNonCommodityLoading = nonCommodityIndicators.length > 0 && loadingPdrbDemo

  if (isCommodityLoading || isNonCommodityLoading) {
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


  return (
    <div className={styles.container}>
      {/* ─── SECTION KOMODITAS & INFLASI ─── */}
      {isCommodity && (
        <>
          {/* ─── 1. TABEL KOMODITAS INFLASI ─── */}
          <Wrapper>
            <div className={styles.editHeader}>
              <p className={styles.sectionTitle}>
                {activeSheet === "main"
                  ? `Komoditas Inflasi`
                  : `Edit Sub Komoditas Inflasi`
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

                {/* Year Selector */}
                <div className={styles.yearSelector}>
                  <button
                    type="button"
                    onClick={() => setYearKomoditasInflasi("now")}
                    className={`${styles.yearBtn} ${yearKomoditasInflasi === "now" ? styles.yearBtnActive : ""}`}
                  >
                    {currentYear}
                  </button>
                  <button
                    type="button"
                    onClick={() => setYearKomoditasInflasi("prev")}
                    className={`${styles.yearBtn} ${yearKomoditasInflasi === "prev" ? styles.yearBtnActive : ""}`}
                  >
                    {prevYear}
                  </button>
                  <button
                    type="button"
                    onClick={() => setYearKomoditasInflasi("prev2")}
                    className={`${styles.yearBtn} ${yearKomoditasInflasi === "prev2" ? styles.yearBtnActive : ""}`}
                  >
                    {prev2Year}
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
                        {komoditasList.map((item, cIndex) => (
                          <th key={cIndex}>{item.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {monthNames.map((mName, index) => (
                        <tr key={index}>
                          <td className={styles.monthCol}>{mName}</td>
                          {komoditasList.map((cItem, cIndex) => {
                            const val = getCommodityMonthVal(cItem.data, index)
                            return (
                              <td key={cIndex}>
                                <Input
                                  type="text"
                                  placeholder="0.00"
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
                      {monthNames.map((mName, index) => (
                        <tr key={index}>
                          <td className={styles.monthCol}>{mName}</td>
                          {subList.map((subItem, sIndex) => {
                            const val = getCommodityMonthVal(subItem.data, index)
                            return (
                              <td key={sIndex}>
                                <Input
                                  type="text"
                                  placeholder="0.00"
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

          {/* ─── 2. TABEL KOMODITAS IHK (TANPA YOY & YTD) ─── */}
          <Wrapper>
            <div className={styles.editHeader}>
              <div>
                <p className={styles.sectionTitle}>
                  {activeSheetIhk === "main"
                    ? `Komoditas IHK`
                    : `Edit Sub Komoditas IHK`
                  }
                </p>
                <p style={{ color: '#94A3B8', fontSize: 13, margin: '4px 0 0 0' }}>
                  Indeks Harga Konsumen per kelompok komoditas (Level indeks, tidak ada YoY dan YtD).
                </p>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Year Selector Only */}
                <div className={styles.yearSelector}>
                  <button
                    type="button"
                    onClick={() => setYearKomoditasIhk("now")}
                    className={`${styles.yearBtn} ${yearKomoditasIhk === "now" ? styles.yearBtnActive : ""}`}
                  >
                    {currentYear}
                  </button>
                  <button
                    type="button"
                    onClick={() => setYearKomoditasIhk("prev")}
                    className={`${styles.yearBtn} ${yearKomoditasIhk === "prev" ? styles.yearBtnActive : ""}`}
                  >
                    {prevYear}
                  </button>
                  <button
                    type="button"
                    onClick={() => setYearKomoditasIhk("prev2")}
                    className={`${styles.yearBtn} ${yearKomoditasIhk === "prev2" ? styles.yearBtnActive : ""}`}
                  >
                    {prev2Year}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                {activeSheetIhk === "main" ? (
                  <>
                    <thead>
                      <tr>
                        <th>Bulan</th>
                        {komoditasIhkList.map((item, cIndex) => (
                          <th key={cIndex}>{item.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {monthNames.map((mName, index) => (
                        <tr key={index}>
                          <td className={styles.monthCol}>{mName}</td>
                          {komoditasIhkList.map((cItem, cIndex) => {
                            const val = getCommodityMonthVal(cItem.data, index)
                            return (
                              <td key={cIndex}>
                                <Input
                                  type="text"
                                  placeholder="100.00"
                                  value={val}
                                  setValue={(newVal) => handleKomoditasIhkChange(cIndex, index, newVal)}
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
                        {subIhkList.map((subItem, sIndex) => (
                          <th key={sIndex}>{subItem.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {monthNames.map((mName, index) => (
                        <tr key={index}>
                          <td className={styles.monthCol}>{mName}</td>
                          {subIhkList.map((subItem, sIndex) => {
                            const val = getCommodityMonthVal(subItem.data, index)
                            return (
                              <td key={sIndex}>
                                <Input
                                  type="text"
                                  placeholder="100.00"
                                  value={val}
                                  setValue={(newVal) => handleSubKomoditasIhkChange(activeCommodityIhkIndex, sIndex, index, newVal)}
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
                onClick={() => setActiveSheetIhk("main")}
                className={`${styles.sheetTab} ${activeSheetIhk === "main" ? styles.sheetTabActive : ""}`}
              >
                Sheet Utama
              </button>
              {komoditasIhkList.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveSheetIhk(index.toString())}
                  className={`${styles.sheetTab} ${activeSheetIhk === index.toString() ? styles.sheetTabActive : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Wrapper>

          {/* ─── 3. TABEL IHK UMUM ─── */}
          <Wrapper>
            <div className={styles.editHeader}>
              <div>
                <p className={styles.sectionTitle}>
                  IHK Umum
                </p>
                <p style={{ color: '#94A3B8', fontSize: 13, margin: '4px 0 0 0' }}>
                  Indeks Harga Konsumen (IHK) Gabungan Kota.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Year Selector Only */}
                <div className={styles.yearSelector}>
                  <button
                    type="button"
                    onClick={() => setYearIhkUmum("now")}
                    className={`${styles.yearBtn} ${yearIhkUmum === "now" ? styles.yearBtnActive : ""}`}
                  >
                    {currentYear}
                  </button>
                  <button
                    type="button"
                    onClick={() => setYearIhkUmum("prev")}
                    className={`${styles.yearBtn} ${yearIhkUmum === "prev" ? styles.yearBtnActive : ""}`}
                  >
                    {prevYear}
                  </button>
                  <button
                    type="button"
                    onClick={() => setYearIhkUmum("prev2")}
                    className={`${styles.yearBtn} ${yearIhkUmum === "prev2" ? styles.yearBtnActive : ""}`}
                  >
                    {prev2Year}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '140px' }}>Bulan</th>
                    <th>IHK Umum ({yearIhkUmum === "now" ? currentYear : yearIhkUmum === "prev" ? prevYear : prev2Year})</th>
                  </tr>
                </thead>
                <tbody>
                  {monthNames.map((mName, index) => (
                    <tr key={index}>
                      <td className={styles.monthCol}>{mName}</td>
                      <td>
                        <Input
                          type="text"
                          placeholder="100.00"
                          value={activeDataIhk[index] ? activeDataIhk[index].value : ""}
                          setValue={(val) => handleIhkChange(index, val)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Wrapper>

          {/* ─── 4. TABEL INFLASI UMUM ─── */}
          <Wrapper>
            <div className={styles.editHeader}>
              <div>
                <p className={styles.sectionTitle}>
                  Inflasi Umum
                </p>
                <p style={{ color: '#94A3B8', fontSize: 13, margin: '4px 0 0 0' }}>
                  Tingkat Inflasi Umum Gabungan: Bulan ke Bulan (MoM), Tahun ke Tahun (YoY), dan Tahun Kalender (YtD).
                </p>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Year Selector */}
                <div className={styles.yearSelector}>
                  <button
                    type="button"
                    onClick={() => setYearInflasiUmum("now")}
                    className={`${styles.yearBtn} ${yearInflasiUmum === "now" ? styles.yearBtnActive : ""}`}
                  >
                    {currentYear}
                  </button>
                  <button
                    type="button"
                    onClick={() => setYearInflasiUmum("prev")}
                    className={`${styles.yearBtn} ${yearInflasiUmum === "prev" ? styles.yearBtnActive : ""}`}
                  >
                    {prevYear}
                  </button>
                  <button
                    type="button"
                    onClick={() => setYearInflasiUmum("prev2")}
                    className={`${styles.yearBtn} ${yearInflasiUmum === "prev2" ? styles.yearBtnActive : ""}`}
                  >
                    {prev2Year}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '140px' }}>Bulan</th>
                    <th>Inflasi MoM (%)</th>
                    <th>Inflasi YoY (%)</th>
                    <th>Inflasi YtD (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {monthNames.map((mName, index) => (
                    <tr key={index}>
                      <td className={styles.monthCol}>{mName}</td>
                      <td>
                        <Input
                          type="text"
                          placeholder="0.00"
                          value={activeDataInflasiMoM[index] ? activeDataInflasiMoM[index].value : ""}
                          setValue={(val) => handleInflasiMetricChange("mom", index, val)}
                        />
                      </td>
                      <td>
                        <Input
                          type="text"
                          placeholder="0.00"
                          value={activeDataInflasiYoY[index] ? activeDataInflasiYoY[index].value : ""}
                          setValue={(val) => handleInflasiMetricChange("yoy", index, val)}
                        />
                      </td>
                      <td>
                        <Input
                          type="text"
                          placeholder="0.00"
                          value={activeDataInflasiYtd[index] ? activeDataInflasiYtd[index].value : ""}
                          setValue={(val) => handleInflasiMetricChange("ytd", index, val)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Wrapper>


          {/* Bobot per Komoditas Section */}
          <Wrapper>
            <div className={styles.editHeader}>
              <div>
                <p className={styles.sectionTitle}>Bobot per Komoditas</p>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>No</th>
                    <th>Kelompok Komoditas</th>
                    <th style={{ width: '220px' }}>Bobot / Timbangan (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {komoditasList.map((cItem, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: 'center' }}>{index + 1}</td>
                      <td style={{ fontWeight: 500 }}>{cItem.label}</td>
                      <td>
                        <Input
                          type="text"
                          placeholder="Masukkan bobot (%)"
                          value={commodityWeights[cItem.label] !== undefined ? commodityWeights[cItem.label] : ""}
                          setValue={(val) => handleWeightChange(cItem.label, val)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Wrapper>


          {/* Hierarki Preview */}
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
                  width={1350}
                  height={treeHeight}
                  fill={"rgba(255, 255, 255, 0.04)"}
                  stroke={"rgba(255, 255, 255, 0.2)"}
                  textColor={"#F8FAFC"}
                  lineColor={"rgba(255, 255, 255, 0.15)"}
                />
              </div>
            </div>
          </Wrapper>
        </>
      )}

      {/* ─── SECTION TERPISAH PER INDIKATOR NON-KOMODITAS ─── */}
      {nonCommodityIndicators.map((indicatorKey) => {
        const itemData = pdrbDemoMap[indicatorKey]
        const varLabel = itemData?.var?.label || indicatorKey
        const cityName = itemData?.kota || userCityName || "KOTA METRO"

        return (
          <Wrapper key={indicatorKey}>
            <div className={styles.editHeader}>
              <p className={styles.sectionTitle}>
                {varLabel}
              </p>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>No</th>
                    <th>Kategori / Sub Variabel</th>
                    <th>Tahun / Periode</th>
                    <th>Nilai Data</th>
                  </tr>
                </thead>
                <tbody>
                  {(itemData?.data || []).map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                      <td>{row.turvarLabel || (row.turvarVal ? `Kategori ${row.turvarVal}` : "Utama")}</td>
                      <td style={{ textAlign: 'center' }}>{row.tahunLabel || "Terbaru"}</td>
                      <td>
                        <Input
                          type="text"
                          placeholder="Masukkan nilai"
                          value={row.value !== undefined && row.value !== null ? row.value : ""}
                          setValue={(val) => handlePdrbDemoValueChange(indicatorKey, idx, val)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Wrapper>
        )
      })}

      {/* ─── FORECASTING INDIKATOR DINAMIS ─── */}
      <Wrapper>
        <div className={styles.forecastingContainer}>
          <div className={styles.forecastingHeader}>
            <div>
              <p className={styles.sectionTitle}>Forecasting (Prediksi)</p>
              <p className={styles.forecastingDesc}>
                Aktifkan untuk menghasilkan prediksi indikator periode berikutnya menggunakan model Machine Learning / ANN.
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
                  onClick={(e) => { e.stopPropagation(); setForecastingEnabled(false) }}
                  className={`${styles.sliderBtn} ${!forecastingEnabled ? styles.sliderBtnActiveTidak : ""}`}
                  aria-pressed={forecastingEnabled}
                >
                  Tidak
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setForecastingEnabled(true) }}
                  className={`${styles.sliderBtn} ${forecastingEnabled ? styles.sliderBtnActiveYa : ""}`}
                  aria-pressed={!forecastingEnabled}
                >
                  Ya
                </button>
              </div>
            </div>
          </div>

          {forecastingEnabled && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className={styles.forecastingNote}>
                <span className={styles.forecastingNoteIcon}>✦</span>
                <p>
                  Model <strong>ANN (Artificial Neural Network - Keras/TensorFlow)</strong> menghitung peramalan berdasarkan data historis database.
                  {annForecastResult?.forecast && (
                    <span style={{ display: 'block', marginTop: '4px', color: '#34B34A', fontSize: '12px' }}>
                      ✓ Terhubung dengan Backend API & Database | Hasil Prediksi Tersedia untuk {userCityName || "KOTA METRO"}
                    </span>
                  )}
                </p>
              </div>

              {isCommodity && (
                <>
                  {/* ─── 1. INFLASI UMUM ─── */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#F8FAFC' }}>
                        1. Prediksi Inflasi Umum 3 Periode Ke Depan ({userCityName || "KOTA METRO"})
                      </p>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', color: '#AAAAAA' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fb3131ff', display: 'inline-block' }} />
                          <span>MoM</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34B34A', display: 'inline-block' }} />
                          <span>YoY</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F0B244', display: 'inline-block' }} />
                          <span>YtD</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: '220px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={forecastChartData}
                          margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="forecastGradMom" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#fb3131ff" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="#fb3131ff" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="forecastGradYoy" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#34B34A" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="#34B34A" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="forecastGradYtd" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#F0B244" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="#F0B244" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(255, 255, 255, 0.08)" strokeWidth={0.5} />
                          <XAxis
                            dataKey="label"
                            axisLine={{ stroke: 'rgba(255, 255, 255, 0.15)', strokeWidth: 0.5 }}
                            tickLine={false}
                            tick={{ fill: '#AAAAAA', fontSize: 10 }}
                          />
                          <YAxis
                            axisLine={{ stroke: 'rgba(255, 255, 255, 0.15)', strokeWidth: 0.5 }}
                            tickLine={false}
                            tick={{ fill: '#AAAAAA', fontSize: 10 }}
                            domain={['auto', 'auto']}
                            unit="%"
                          />
                          <Tooltip content={<CustomForecastTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="mom"
                            name="MoM"
                            stroke="#fb3131ff"
                            fill="url(#forecastGradMom)"
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#fb3131ff' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="yoy"
                            name="YoY"
                            stroke="#34B34A"
                            fill="url(#forecastGradYoy)"
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#34B34A' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="ytd"
                            name="YtD"
                            stroke="#F0B244"
                            fill="url(#forecastGradYtd)"
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#F0B244' }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Summary Cards for Inflasi */}
                    <div className={styles.forecastCardGrid}>
                      {forecastChartData.filter(d => d.isForecast).map((item, idx) => (
                        <div key={idx} className={styles.forecastCard}>
                          <span className={styles.forecastCardMonth}>{item.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span className={styles.forecastCardValue}>{item.mom > 0 ? `+${item.mom}` : item.mom}%</span>
                            <span className={item.mom >= 0 ? styles.forecastBadgePositive : styles.forecastBadgeNegative}>
                              {item.mom >= 0 ? 'Inflasi' : 'Deflasi'}
                            </span>
                          </div>
                          <span className={styles.forecastCardSub}>YoY: {item.yoy}% | YtD: {item.ytd}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ─── 2. IHK UMUM ─── */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#F8FAFC' }}>
                        2. Prediksi IHK Umum (Indeks Harga Konsumen) 3 Periode Ke Depan ({userCityName || "KOTA METRO"})
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#AAAAAA' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8', display: 'inline-block' }} />
                        <span>Indeks IHK</span>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: '220px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={forecastIhkChartData}
                          margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="forecastGradIhk" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(255, 255, 255, 0.08)" strokeWidth={0.5} />
                          <XAxis
                            dataKey="label"
                            axisLine={{ stroke: 'rgba(255, 255, 255, 0.15)', strokeWidth: 0.5 }}
                            tickLine={false}
                            tick={{ fill: '#AAAAAA', fontSize: 10 }}
                          />
                          <YAxis
                            axisLine={{ stroke: 'rgba(255, 255, 255, 0.15)', strokeWidth: 0.5 }}
                            tickLine={false}
                            tick={{ fill: '#AAAAAA', fontSize: 10 }}
                            domain={['auto', 'auto']}
                          />
                          <Tooltip content={<CustomForecastTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="ihk"
                            name="IHK"
                            stroke="#38BDF8"
                            fill="url(#forecastGradIhk)"
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#38BDF8' }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Summary Cards for IHK */}
                    <div className={styles.forecastCardGrid}>
                      {forecastIhkChartData.filter(d => d.isForecast).map((item, idx) => (
                        <div key={idx} className={styles.forecastCard}>
                          <span className={styles.forecastCardMonth}>{item.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span className={styles.forecastCardValue} style={{ color: '#38BDF8' }}>{item.ihk}</span>
                            <span className={styles.forecastBadgeNeutral}>Indeks</span>
                          </div>
                          <span className={styles.forecastCardSub}>Tingkat IHK Prediksi</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ─── 3. INFLASI KOMODITAS ─── */}
                  <div className={styles.tableContainer}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 600, color: '#F8FAFC' }}>
                      3. Prediksi Inflasi 11 Kelompok Komoditas (MoM %)
                    </p>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th style={{ width: '50px', textAlign: 'center' }}>No</th>
                          <th>Kelompok Pengeluaran / Komoditas</th>
                          <th style={{ textAlign: 'center' }}>T+1 ({forecastKomoditasList[0]?.t1Label || "M1"})</th>
                          <th style={{ textAlign: 'center' }}>T+2 ({forecastKomoditasList[0]?.t2Label || "M2"})</th>
                          <th style={{ textAlign: 'center' }}>T+3 ({forecastKomoditasList[0]?.t3Label || "M3"})</th>
                          <th style={{ textAlign: 'center' }}>Status / Tren</th>
                        </tr>
                      </thead>
                      <tbody>
                        {forecastKomoditasList.map((item, idx) => (
                          <tr key={idx}>
                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                            <td style={{ fontWeight: 500 }}>{item.name}</td>
                            <td style={{ textAlign: 'center', fontWeight: 600, color: item.t1 >= 0 ? '#F87171' : '#34B34A' }}>
                              {item.t1 > 0 ? `+${item.t1}` : item.t1}%
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 600, color: item.t2 >= 0 ? '#F87171' : '#34B34A' }}>
                              {item.t2 > 0 ? `+${item.t2}` : item.t2}%
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 600, color: item.t3 >= 0 ? '#F87171' : '#34B34A' }}>
                              {item.t3 > 0 ? `+${item.t3}` : item.t3}%
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={item.t1 >= 0 ? styles.forecastBadgePositive : styles.forecastBadgeNegative}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ─── 4. IHK KOMODITAS ─── */}
                  <div className={styles.tableContainer}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 600, color: '#F8FAFC' }}>
                      4. Prediksi IHK 11 Kelompok Komoditas (Indeks)
                    </p>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th style={{ width: '50px', textAlign: 'center' }}>No</th>
                          <th>Kelompok Pengeluaran / Komoditas</th>
                          <th style={{ textAlign: 'center' }}>IHK Terakhir</th>
                          <th style={{ textAlign: 'center' }}>T+1 ({forecastKomoditasIhkList[0]?.t1Label || "M1"})</th>
                          <th style={{ textAlign: 'center' }}>T+2 ({forecastKomoditasIhkList[0]?.t2Label || "M2"})</th>
                          <th style={{ textAlign: 'center' }}>T+3 ({forecastKomoditasIhkList[0]?.t3Label || "M3"})</th>
                          <th style={{ textAlign: 'center' }}>Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {forecastKomoditasIhkList.map((item, idx) => (
                          <tr key={idx}>
                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                            <td style={{ fontWeight: 500 }}>{item.name}</td>
                            <td style={{ textAlign: 'center', color: '#94A3B8' }}>{item.lastIhk}</td>
                            <td style={{ textAlign: 'center', fontWeight: 600, color: '#38BDF8' }}>
                              {item.t1Ihk}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 600, color: '#38BDF8' }}>
                              {item.t2Ihk}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 600, color: '#38BDF8' }}>
                              {item.t3Ihk}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={styles.forecastBadgeNeutral}>
                                Indeks Komoditas
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* ─── PROYEKSI INDIKATOR NON-KOMODITAS ─── */}
              {nonCommodityIndicators.map(key => {
                const itemData = forecastNonCommodityData[key];
                if (!itemData || !itemData.data || itemData.data.length === 0) return null;

                return (
                  <div key={key} className={styles.tableContainer}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 600, color: '#F8FAFC' }}>
                      Prediksi {itemData.label} (Periode Mendatang)
                    </p>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th style={{ width: '50px', textAlign: 'center' }}>No</th>
                          <th>Kategori / Sub Variabel</th>
                          <th style={{ textAlign: 'center' }}>Nilai Terakhir</th>
                          <th style={{ textAlign: 'center' }}>Proyeksi Periode +1</th>
                          <th style={{ textAlign: 'center' }}>Proyeksi Periode +2</th>
                          <th style={{ textAlign: 'center' }}>Estimasi Pertumbuhan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemData.data.map((row, idx) => (
                          <tr key={idx}>
                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                            <td style={{ fontWeight: 500 }}>{row.turvarLabel}</td>
                            <td style={{ textAlign: 'center' }}>{row.currentVal}</td>
                            <td style={{ textAlign: 'center', fontWeight: 600, color: '#38BDF8' }}>
                              {row.predNext}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 600, color: '#818CF8' }}>
                              {row.predNext2}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={styles.forecastBadgeNeutral}>
                                +{row.growthRate}% / thn
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Wrapper>

      <MainButton onClick={handleSave}>Simpan & Lanjutkan</MainButton>
    </div>
  )
}

function StepThree(props) {
  const { setStep, datasetSource, uploadedDataset, analysisTitle } = props
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [aiSummary, setAiSummary] = useState(null)
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

  // Manual Dataset validation branch
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
          <AILoader text="Menganalisis data & memuat editor laporan BRS..." minHeight="220px" />
        </Wrapper>
      ) : (
        <>
          {/* Ringkasan AI */}
          {aiSummary && (
            <Wrapper>
              <div className={styles.sectionWrapper}>
                <div className={styles.iconWrapper}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34B34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <div>
                  <p className={styles.sectionTitle}>Ringkasan Eksekutif BRS</p>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 13, marginBottom: '16px', fontStyle: "italic" }}>
                    Kondisi perekonomian daerah {uploadedDataset?.context?.city || "Kota Metro"} hasil kompilasi indikator BPS:
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

          {/* Key Parameters Cards */}
          <Wrapper>
            <p className={styles.sectionTitle}>Ringkasan Parameter Data Utama</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>IHK Terakhir</span>
                <span style={{ fontSize: 16, color: '#fff', fontWeight: 600 }}>{ihkValue}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Inflasi MoM</span>
                <span style={{ fontSize: 16, color: '#34B34A', fontWeight: 600 }}>{inflasiValue}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Inflasi YoY</span>
                <span style={{ fontSize: 16, color: '#34B34A', fontWeight: 600 }}>{yoyValue}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Komoditas Pendorong</span>
                <span style={{ fontSize: 15, color: '#fff', fontWeight: 600 }}>{pendorong}</span>
              </div>
            </div>
          </Wrapper>

          {/* REUSABLE MS WORD EDITOR COMPONENT */}
          <WordEditor
            uploadedDataset={uploadedDataset}
            analysisTitle={analysisTitle}
            serverUrl={process.env.REACT_APP_URL_SERVER}
          />

          {error && <p style={{ color: '#ef4444', marginTop: 16, fontSize: 14 }}>{error}</p>}
        </>
      )}
    </div>
  )
}