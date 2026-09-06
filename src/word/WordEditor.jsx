import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./WordEditor.module.css";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

/**
 * Reusable Word Editor Component
 * Engine ditempatkan di public/word-editor/ dan disematkan via iframe yang dapat berkomunikasi
 * dua arah (postMessage) untuk mengisi data template BRS, pratinjau, ekspor DOCX/PDF, dan simpan ke DB.
 */
export default function WordEditor({
  uploadedDataset,
  analysisTitle = "Berita Resmi Statistik",
  onSaved,
  serverUrl = process.env.REACT_APP_URL_SERVER || "",
  editorBasePath = ""
}) {
  const editorIframeRef = useRef(null);
  const editorUrl = editorBasePath || `${serverUrl}/word-editor`;
  const [editorReady, setEditorReady] = useState(false);
  const [generatingDoc, setGeneratingDoc] = useState(false);
  const [, setPopulatedDocUrl] = useState(null);
  const [savingToDb, setSavingToDb] = useState(false);
  const [savedHistoryId, setSavedHistoryId] = useState(null);
  const [savedDocxUrl, setSavedDocxUrl] = useState(null);
  const [savedPdfUrl, setSavedPdfUrl] = useState(null);
  const [error, setError] = useState("");

  const targetCity = uploadedDataset?.context?.city || "Kota Metro";
  const currentCalPeriod = `${MONTH_NAMES[new Date().getMonth()]} ${new Date().getFullYear()}`;
  const targetPeriod = uploadedDataset?.context?.period || currentCalPeriod;
  const reportTitle = uploadedDataset?.context?.title || analysisTitle || "Berita Resmi Statistik";

  // Helper: Open document in MS Word Editor iframe
  const loadDocInEditor = (templateFile = "BERITA_FILLED.docx") => {
    if (!editorIframeRef.current?.contentWindow) return;
    const sanitizedCity = (uploadedDataset?.context?.city || "Kota Metro").replace(/[^a-zA-Z0-9]/g, "_");
    const sanitizedPeriod = (uploadedDataset?.context?.period || currentCalPeriod).replace(/[^a-zA-Z0-9]/g, "_");
    const docUrl = `${serverUrl}/word-editor/template/${templateFile}`;

    editorIframeRef.current.contentWindow.postMessage(
      {
        type: "document:open-url",
        payload: {
          url: docUrl,
          fileName: `BERITA_${sanitizedCity}_${sanitizedPeriod}.docx`,
        },
      },
      "*"
    );
  };

  // Main Generator: Generate Word BRS with ALL ${} replaced by Step 3 data
  const generatePopulatedWordDoc = async () => {
    setGeneratingDoc(true);
    setError("");
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${serverUrl}/api/analisis/word/generate`,
        {
          city: targetCity,
          periode: targetPeriod,
          title: reportTitle,
          uploadedDataset: uploadedDataset,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success && res.data?.fullUrl) {
        setPopulatedDocUrl(res.data.fullUrl);
        if (editorIframeRef.current?.contentWindow) {
          editorIframeRef.current.contentWindow.postMessage(
            {
              type: "document:open-url",
              payload: {
                url: res.data.fullUrl,
                fileName: res.data.filename,
              },
            },
            "*"
          );
        }
        return res.data.fullUrl;
      }
    } catch (err) {
      console.error("Gagal generate dokumen BRS terisi:", err.message);
      // Fallback: load pre-filled template
      loadDocInEditor("BERITA_FILLED.docx");
    } finally {
      setGeneratingDoc(false);
    }
  };

  // Helper: Convert File to Base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  // Helper: Request save from Word Editor iframe and return exported File
  const requestIframeSave = (ext) => {
    return new Promise((resolve, reject) => {
      if (!editorIframeRef.current?.contentWindow) {
        return reject(new Error("Editor iframe belum siap"));
      }

      const timeout = setTimeout(() => {
        window.removeEventListener("message", messageHandler);
        reject(new Error(`Batas waktu ekspor dokumen ${ext} habis`));
      }, 30000);

      const messageHandler = (event) => {
        const d = event.data;
        if (!d || typeof d !== "object") return;

        if (d.type === "document:saved" && d.payload?.file) {
          clearTimeout(timeout);
          window.removeEventListener("message", messageHandler);
          resolve(d.payload.file);
        } else if (d.type === "document:error") {
          clearTimeout(timeout);
          window.removeEventListener("message", messageHandler);
          reject(new Error(d.payload?.message || "Gagal mengekspor dokumen dari editor"));
        }
      };

      window.addEventListener("message", messageHandler);

      editorIframeRef.current.contentWindow.postMessage(
        {
          type: "document:save",
          payload: { targetExt: ext.toUpperCase() },
        },
        "*"
      );
    });
  };

  // Listen to iframe embed events
  useEffect(() => {
    const handleEditorMessage = (event) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "document:ready") {
        setEditorReady(true);
        // Automatically generate & populate Word document with real Step 3 data!
        generatePopulatedWordDoc();
      }
    };

    window.addEventListener("message", handleEditorMessage);
    return () => {
      window.removeEventListener("message", handleEditorMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedDataset]);

  // Main Action: Save Word Analysis (DOCX & PDF) to Database
  const handleSaveToDatabase = async () => {
    setSavingToDb(true);
    setError("");
    try {
      const token = localStorage.getItem("token");

      // 1. Export DOCX from editor
      const docxBlob = await requestIframeSave("DOCX");
      const docxBase64 = await fileToBase64(docxBlob);

      // 2. Export PDF from editor
      let pdfBase64 = "";
      try {
        const pdfBlob = await requestIframeSave("PDF");
        pdfBase64 = await fileToBase64(pdfBlob);
      } catch (pdfErr) {
        console.warn("Gagal mengekspor PDF secara otomatis:", pdfErr.message);
      }

      // 3. Post to backend
      const res = await axios.post(
        `${serverUrl}/api/analisis/word/save`,
        {
          title: reportTitle,
          city: targetCity,
          periode: targetPeriod,
          docxBase64,
          pdfBase64,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        setSavedHistoryId(res.data.historyId);
        setSavedDocxUrl(res.data.docxUrl);
        setSavedPdfUrl(res.data.pdfUrl);
        if (typeof onSaved === "function") {
          onSaved(res.data);
        }
      }
    } catch (err) {
      console.error("Gagal menyimpan ke database:", err.message);
      setError("Gagal menyimpan analisis: " + (err.response?.data?.message || err.message));
    } finally {
      setSavingToDb(false);
    }
  };

  // Download DOCX handler
  const handleDownloadDocx = async () => {
    if (savedDocxUrl) {
      const link = document.createElement("a");
      link.href = `${serverUrl}${savedDocxUrl}`;
      link.download = `Laporan_BRS_${(uploadedDataset?.context?.city || "Kota_Metro").replace(/\s+/g, "_")}.docx`;
      link.click();
      return;
    }

    try {
      const docxFile = await requestIframeSave("DOCX");
      const url = window.URL.createObjectURL(docxFile);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan_BRS_${(uploadedDataset?.context?.city || "Kota_Metro").replace(/\s+/g, "_")}.docx`;
      link.click();
    } catch (err) {
      setError("Gagal mengunduh file DOCX: " + err.message);
    }
  };

  // Download PDF handler
  const handleDownloadPdf = async () => {
    if (savedPdfUrl) {
      const link = document.createElement("a");
      link.href = `${serverUrl}${savedPdfUrl}`;
      link.download = `Laporan_BRS_${(uploadedDataset?.context?.city || "Kota_Metro").replace(/\s+/g, "_")}.pdf`;
      link.click();
      return;
    }

    try {
      const pdfFile = await requestIframeSave("PDF");
      const url = window.URL.createObjectURL(pdfFile);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan_BRS_${(uploadedDataset?.context?.city || "Kota_Metro").replace(/\s+/g, "_")}.pdf`;
      link.click();
    } catch (err) {
      setError("Gagal mengunduh file PDF: " + err.message);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {/* MS WORD EDITOR CARD */}
      <div className={styles.wordEditorCard}>
        <div className={styles.wordEditorToolbar}>
          <div className={styles.wordEditorInfo}>
            <span className={styles.wordEditorBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              MS Word Editor
            </span>
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>
              {targetCity} • {targetPeriod}
            </span>
            {!editorReady ? (
              <span style={{ fontSize: "11px", color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "2px 8px", borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                ● Menghubungkan Editor...
              </span>
            ) : generatingDoc ? (
              <span style={{ fontSize: "11px", color: "#38bdf8", background: "rgba(56,189,248,0.1)", padding: "2px 8px", borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                ● Mengisi Variabel dari Step 3...
              </span>
            ) : (
              <span style={{ fontSize: "11px", color: "#34D399", background: "rgba(52,211,153,0.1)", padding: "2px 8px", borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                ● Data Step 3 Terisi
              </span>
            )}
          </div>

          <div className={styles.wordEditorActions}>
            <button
              type="button"
              onClick={generatePopulatedWordDoc}
              disabled={generatingDoc}
              className={styles.wordEditorBtnSecondary}
              title="Isi ulang semua variabel template dengan data riil dari Step 3"
              style={{ borderColor: "#38bdf8", color: "#38bdf8" }}
            >
              {generatingDoc ? (
                <span>⏳ Memproses...</span>
              ) : (
                <span>🔄 Isi Data Step 3</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => loadDocInEditor("BERITA_FILLED.docx")}
              className={styles.wordEditorBtnSecondary}
              title="Muat template standar BERITA_FILLED.docx"
            >
              <span>✨ Data Sampel</span>
            </button>
            <button
              type="button"
              onClick={() => loadDocInEditor("BERITA.docx")}
              className={styles.wordEditorBtnSecondary}
              title="Muat template mentah BERITA.docx dengan variabel placeholder"
            >
              <span>📄 Template Mentah</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadDocx}
              className={styles.wordEditorBtnSecondary}
              title="Unduh dokumen dalam format Word (.docx)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Unduh DOCX
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className={styles.wordEditorBtnSecondary}
              title="Unduh dokumen dalam format PDF"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Unduh PDF
            </button>

            <button
              type="button"
              onClick={handleSaveToDatabase}
              disabled={savingToDb}
              className={styles.wordEditorBtnPrimary}
              title="Simpan dokumen Word dan PDF ke database"
            >
              {savingToDb ? (
                <>
                  <div style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }} />
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Simpan ke Database (PDF & DOCX)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Embedded Document Editor Engine */}
        <iframe
          ref={editorIframeRef}
          src={`${editorUrl}/index.html?embed=true`}
          className={styles.wordEditorIframe}
          title="MS Word Editor Engine"
        />
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      {/* Success Card when saved */}
      {savedHistoryId && (
        <div className={styles.wordSuccessCard}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#34B34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div>
            <p style={{ fontSize: 20, color: "#fff", fontWeight: 600, margin: "0 0 6px" }}>
              Dokumen BRS Berhasil Disimpan ke Database!
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: 0 }}>
              Laporan analisis untuk {uploadedDataset?.context?.city || "Kota Metro"} periode {uploadedDataset?.context?.period} tersimpan dalam format <strong>DOCX</strong> dan <strong>PDF</strong>.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <button type="button" onClick={handleDownloadDocx} className={styles.wordEditorBtnSecondary}>
              📄 Unduh Berkas DOCX
            </button>
            <button type="button" onClick={handleDownloadPdf} className={styles.wordEditorBtnPrimary}>
              📑 Unduh Berkas PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
