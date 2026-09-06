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
  const [, setEditorReady] = useState(false);
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
        generatePopulatedWordDoc();
      } else if (data.type === "analisis:reload") {
        generatePopulatedWordDoc();
      } else if (data.type === "analisis:download-docx") {
        handleDownloadDocx();
      } else if (data.type === "analisis:download-pdf") {
        handleDownloadPdf();
      } else if (data.type === "analisis:save") {
        handleSaveToDatabase();
      }
    };

    window.addEventListener("message", handleEditorMessage);
    return () => {
      window.removeEventListener("message", handleEditorMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedDataset, savedDocxUrl, savedPdfUrl, reportTitle, targetCity, targetPeriod]);

  // Sync state (generating, saving) to buttons in OnlyOffice header
  useEffect(() => {
    try {
      editorIframeRef.current?.contentWindow?.postMessage(
        {
          type: "analisis:state",
          payload: { generating: generatingDoc, saving: savingToDb },
        },
        "*"
      );
    } catch {}
  }, [generatingDoc, savingToDb]);

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
    <div className={styles.editorLayout}>
      {/* Embedded Document Editor Engine - Full Height */}
      <iframe
        ref={editorIframeRef}
        src={`${editorUrl}/index.html?embed=true`}
        className={styles.editorIframe}
        title="Document Editor Engine"
      />

      {/* Toast Feedback */}
      {savedHistoryId && (
        <div className={styles.toast}>
          ✓ Dokumen BRS berhasil disimpan ke database
        </div>
      )}
      {error && (
        <div className={styles.errorToast}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}
