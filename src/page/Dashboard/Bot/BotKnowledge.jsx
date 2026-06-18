import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./BotKnowledge.module.css";
import Wrapper from "../../../components/Wrapper/Wrapper";
import MainButton from "../../../components/MainButton/MainButton";
import Input from "../../../components/Input/Input";
import Skeleton from "../../../components/Skeleton/Skeleton";

export default function BotKnowledge() {
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [currentItemId, setCurrentItemId] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [content, setContent] = useState("");
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");
  const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";

  const fetchKnowledge = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/users/bot/knowledge`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKnowledgeList(res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data knowledge:", err.message);
      setError("Gagal memuat basis pengetahuan bot.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const openAddModal = () => {
    setModalMode("add");
    setCurrentItemId(null);
    setTitle("");
    setCategory("General");
    setContent("");
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode("edit");
    setCurrentItemId(item._id);
    setTitle(item.title);
    setCategory(item.category || "General");
    setContent(item.content);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setModalError("Judul dan Konten wajib diisi");
      return;
    }

    setSaving(true);
    setModalError("");
    setError("");
    setSuccess("");

    try {
      if (modalMode === "add") {
        await axios.post(
          `${serverUrl}/api/users/bot/knowledge`,
          { title, category, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("Data knowledge berhasil ditambahkan.");
      } else {
        await axios.put(
          `${serverUrl}/api/users/bot/knowledge/${currentItemId}`,
          { title, category, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("Data knowledge berhasil diperbarui.");
      }
      setIsModalOpen(false);
      fetchKnowledge();
    } catch (err) {
      setModalError(err.response?.data?.message || "Gagal menyimpan data knowledge.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, itemTitle) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus data knowledge "${itemTitle}"?`)) return;
    setError("");
    setSuccess("");
    try {
      await axios.delete(`${serverUrl}/api/users/bot/knowledge/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Data knowledge berhasil dihapus.");
      fetchKnowledge();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menghapus data knowledge.");
    }
  };

  // Import JSON or CSV
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.name.split(".").pop().toLowerCase();
    if (fileType !== "csv" && fileType !== "json") {
      setError("Hanya mendukung file dengan ekstensi .csv atau .json");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const textContent = event.target.result;
      setError("");
      setSuccess("");
      try {
        const res = await axios.post(
          `${serverUrl}/api/users/bot/knowledge/import`,
          {
            format: fileType,
            importData: textContent,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess(res.data.message || "Data berhasil diimpor.");
        fetchKnowledge();
      } catch (err) {
        setError(err.response?.data?.message || "Gagal mengimpor file data.");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset selection
  };

  // Download template CSV & JSON (XLSX template can also be generated as CSV/TSV)
  const handleDownloadTemplate = (type) => {
    let contentStr = "";
    let filename = "";
    let mimeType = "";

    if (type === "csv") {
      contentStr = "judul,kategori,konten\nContoh Judul,Kategori A,Ini adalah konten bot knowledge resmi.";
      filename = "template_bot_knowledge.csv";
      mimeType = "text/csv;charset=utf-8;";
    } else if (type === "json") {
      contentStr = JSON.stringify(
        [
          {
            judul: "Contoh Judul",
            kategori: "Kategori A",
            konten: "Ini adalah konten bot knowledge resmi."
          }
        ],
        null,
        2
      );
      filename = "template_bot_knowledge.json";
      mimeType = "application/json;charset=utf-8;";
    } else if (type === "xlsx") {
      // Return a basic semicolon/comma separated representation or csv labeled as xls
      contentStr = "judul,kategori,konten\nContoh Judul,Kategori A,Ini adalah konten bot knowledge resmi.";
      filename = "template_bot_knowledge.xlsx"; // Note: simple raw text import is supported as CSV
      mimeType = "text/csv;charset=utf-8;";
    }

    const blob = new Blob([contentStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <p className={styles.tabTitle}>Bot Knowledge Base</p>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {success && <div className={styles.successAlert}>{success}</div>}

      <div className={styles.actionBar}>
        <div className={styles.leftActions}>
          <MainButton onClick={openAddModal}>Tambah Knowledge</MainButton>
        </div>

        <div className={styles.rightActions}>
          <button className={styles.actionBtn} onClick={handleImportClick}>
            Import CSV/JSON
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".csv,.json"
            onChange={handleFileChange}
          />
          <div className={styles.templateDropdown}>
            <button className={styles.actionBtn}>Unduh Template</button>
            <div className={styles.dropdownContent}>
              <span onClick={() => handleDownloadTemplate("csv")}>CSV Template</span>
              <span onClick={() => handleDownloadTemplate("json")}>JSON Template</span>
              <span onClick={() => handleDownloadTemplate("xlsx")}>XLSX (CSV format) Template</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <Wrapper>
          <div className={styles.content}>
            {loading ? (
              <div style={{ padding: '16px 0' }}>
                <Skeleton height="180px" />
              </div>
            ) : knowledgeList.length > 0 ? (
              <div className={styles.tableResponsive}>
                <table className={styles.knowledgeTable}>
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>No</th>
                      <th style={{ width: "220px" }}>Judul</th>
                      <th style={{ width: "150px" }}>Kategori</th>
                      <th>Konten</th>
                      <th style={{ width: "160px", textAlign: "center" }}>Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {knowledgeList.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td className={styles.boldText}>{item.title}</td>
                        <td>
                          <span className={styles.categoryBadge}>{item.category}</span>
                        </td>
                        <td className={styles.contentText}>{item.content}</td>
                        <td className={styles.actionsCol}>
                          <button className={styles.editBtn} onClick={() => openEditModal(item)}>
                            Edit
                          </button>
                          <button className={styles.deleteBtn} onClick={() => handleDelete(item._id, item.title)}>
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Belum ada data knowledge yang ditambahkan.</p>
                <small>Asisten Bot asisten Anda tidak akan dapat menjawab apa pun di luar basis pengetahuan instansi Anda. Tambahkan entri baru sekarang.</small>
              </div>
            )}
          </div>
        </Wrapper>
      </div>

      {/* CRUD FORM DIALOG MODAL */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>{modalMode === "add" ? "Tambah Knowledge Baru" : "Edit Data Knowledge"}</h3>
            {modalError && <p className={styles.modalError}>{modalError}</p>}
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Judul / Pertanyaan Pemicu</label>
                <Input
                  type="text"
                  placeholder="Contoh: Jam Pelayanan Kantor BPS Metro"
                  value={title}
                  setValue={setTitle}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Kategori</label>
                <Input
                  type="text"
                  placeholder="Contoh: Jam Kerja, Layanan, Kontak"
                  value={category}
                  setValue={setCategory}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Konten / Informasi Jawaban Resmi</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Tuliskan detail informasi resmi di sini secara lengkap..."
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className={styles.modalBtnRow}>
                <button type="button" className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <MainButton onClick={handleSave}>
                  {saving ? "Menyimpan..." : "Simpan Data"}
                </MainButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
