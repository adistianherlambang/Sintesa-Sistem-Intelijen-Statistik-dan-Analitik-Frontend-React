import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import style from "./HistoriInfografis.module.css"
import { getKanvaProjects } from "../../../logic/kanvaStorage"

function formatDate(id) {
  try {
    const d = new Date(Number(id))
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return '-'
  }
}

export default function HistoriInfografis({ onLoad }) {
  const navigate = useNavigate()
  const [projects] = useState(() => getKanvaProjects().slice(0, 4))

  const handleOpen = (id) => navigate(`/dashboard/infografis/buatInfografis?id=${id}`)
  const handleAll = () => navigate('/dashboard/infografis/histori')

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
              <p className={style.cardDate}>{formatDate(project.id)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}