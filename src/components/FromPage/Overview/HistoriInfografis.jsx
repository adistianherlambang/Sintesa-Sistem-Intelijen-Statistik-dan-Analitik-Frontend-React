import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import style from "./HistoriInfografis.module.css"
import Skeleton from "../../Skeleton/Skeleton"

function formatDate(id, createdAt) {
  try {
    const parseTarget = isNaN(Number(id)) ? createdAt : Number(id);
    const d = new Date(parseTarget)
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return '-'
  }
}

export default function HistoriInfografis({ onLoad }) {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000"
        const response = await axios.get(`${serverUrl}/api/users/infografis`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setProjects((response.data || []).slice(0, 4))
      } catch (err) {
        console.error("Gagal memuat histori infografis overview:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const handleOpen = (id) => navigate(`/dashboard/infografis/buatInfografis?id=${id}`)
  const handleAll = () => navigate('/dashboard/infografis/histori')

  if (loading) {
    return (
      <div className={style.content}>
        <div className={style.titleRow}>
          <p className={style.sectionTitle}>Histori Infografis</p>
        </div>
        <div style={{ marginTop: '12px' }}>
          <Skeleton height="150px" />
        </div>
      </div>
    )
  }

  return (
    <div className={style.content}>
      <div className={style.titleRow}>
        <p className={style.sectionTitle}>Histori Infografis</p>
        <button className={style.seeAllBtn} onClick={handleAll}>Lihat Semua →</button>
      </div>

      {projects.length === 0 ? (
        <div className={style.emptyState}>
          <p className={style.emptyText}>Belum ada infografis. </p>
          <button
            className={style.createBtn}
            onClick={() => navigate('/dashboard/infografis/buatInfografis')}
          >
            Buat Sekarang
          </button>
        </div>
      ) : (
        <div className={style.cardRow}>
          {projects.map((project) => (
            <div
              key={project.id}
              className={style.card}
              onClick={() => handleOpen(project.id)}
              title="Buka editor"
            >
              <div className={style.thumb}>
                {project.preview ? (
                  <img src={project.preview} alt="preview" className={style.thumbImg} />
                ) : (
                  <div className={style.thumbPlaceholder}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
                <div className={style.thumbHover}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
              </div>
              <p className={style.cardDate}>{formatDate(project.id, project.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}