import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import styles from './HistoriInfografisPage.module.css'

function formatDate(id, createdAt) {
  try {
    const parseTarget = isNaN(Number(id)) ? createdAt : Number(id);
    const d = new Date(parseTarget)
    return d.toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return '-'
  }
}

export default function HistoriInfografisPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const token = localStorage.getItem("token")
  const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000"

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${serverUrl}/api/users/infografis`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProjects(response.data || [])
    } catch (err) {
      console.error("Gagal memuat histori infografis:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleOpen = (id) => {
    navigate(`/dashboard/infografis/buatInfografis?id=${id}`)
  }

  const handleNew = () => {
    navigate('/dashboard/infografis/buatInfografis')
  }

  const handleDeleteConfirm = async (id) => {
    try {
      await axios.delete(`${serverUrl}/api/users/infografis/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProjects((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error("Gagal menghapus infografis:", err)
      alert("Gagal menghapus infografis.")
    } finally {
      setDeleteConfirm(null)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.tabTitle}>Histori Infografis</p>
        </div>
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>Memuat histori...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.tabTitle}>Histori Infografis</p>
        <button className={styles.newBtn} onClick={handleNew}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Buat Baru
        </button>
      </div>

      {projects.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </div>
          <p className={styles.emptyTitle}>Belum ada infografis</p>
          <p className={styles.emptyDesc}>Klik "Buat Baru" untuk mulai membuat infografis pertama Anda</p>
          <button className={styles.newBtn} onClick={handleNew}>Buat Infografis Pertama</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {/* New project card */}
          <button className={styles.addCard} onClick={handleNew}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Proyek Baru</span>
          </button>

          {projects.map((project) => (
            <div key={project.id} className={styles.card}>
              {/* Delete confirm overlay */}
              {deleteConfirm === project.id && (
                <div className={styles.deleteOverlay}>
                  <p>Hapus infografis ini?</p>
                  <div className={styles.deleteActions}>
                    <button className={styles.deleteCancelBtn} onClick={() => setDeleteConfirm(null)}>Batal</button>
                    <button className={styles.deleteConfirmBtn} onClick={() => handleDeleteConfirm(project.id)}>Hapus</button>
                  </div>
                </div>
              )}

              {/* Thumbnail */}
              <div className={styles.thumbnail} onClick={() => handleOpen(project.id)}>
                {project.preview ? (
                  <img src={project.preview} alt="Preview" className={styles.thumbnailImg} />
                ) : (
                  <div className={styles.thumbnailPlaceholder}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Tidak ada preview</span>
                  </div>
                )}
                <div className={styles.thumbnailOverlay}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Buka Editor</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className={styles.cardFooter}>
                <div className={styles.cardInfo}>
                  <p className={styles.cardTitle}>
                    Infografis {formatDate(project.id, project.createdAt).split(',')[0]}
                  </p>
                  <p className={styles.cardDate}>{formatDate(project.id, project.createdAt)}</p>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => setDeleteConfirm(project.id)}
                  title="Hapus project"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
