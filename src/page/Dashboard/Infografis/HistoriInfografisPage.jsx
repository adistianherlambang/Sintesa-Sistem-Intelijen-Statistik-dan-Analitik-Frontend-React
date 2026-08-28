import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import styles from './HistoriInfografisPage.module.css'
import Skeleton from '../../../components/Skeleton/Skeleton'

import MainButton from '../../../components/MainButton/MainButton'

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
  const [openMenuId, setOpenMenuId] = useState(null)

  const menuRef = useRef(null)
  const token = localStorage.getItem("token")
  const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000"

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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

  const handleDownload = (project, e) => {
    e.stopPropagation()
    setOpenMenuId(null)
    if (!project.preview) {
      alert("Gambar preview tidak tersedia untuk diunduh.")
      return
    }
    const link = document.createElement("a")
    link.href = project.preview
    link.download = `Infografis-${project.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleMenu = (id, e) => {
    e.stopPropagation()
    setOpenMenuId((prev) => (prev === id ? null : id))
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.tabTitle}>Histori Infografis</p>
        </div>
        <div className={styles.grid}>
          <Skeleton height="260px" />
          <Skeleton height="260px" />
          <Skeleton height="260px" />
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
                  {/* <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Buka Editor</span> */}
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

                <div className={styles.actionMenuWrapper} ref={openMenuId === project.id ? menuRef : null}>
                  <button
                    className={`${styles.menuDotsBtn} ${openMenuId === project.id ? styles.menuDotsBtnActive : ''}`}
                    onClick={(e) => toggleMenu(project.id, e)}
                    title="Opsi Opsi"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="5" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="12" cy="19" r="1.5" />
                    </svg>
                  </button>

                  {openMenuId === project.id && (
                    <div className={styles.dropdownMenu}>
                      <button
                        className={styles.menuItem}
                        onClick={(e) => handleDownload(project, e)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <span>Download</span>
                      </button>

                      <button
                        className={`${styles.menuItem} ${styles.menuItemDelete}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuId(null)
                          setDeleteConfirm(project.id)
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                        <span>Hapus</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
