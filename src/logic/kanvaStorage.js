/**
 * Reads saved infografis projects from Kanva's redux-persist localStorage.
 * Kanva uses redux-persist with key "root" and reducer key "editor".
 *
 * Shape: { id, pages, preview (base64 png thumbnail) }
 */
export function getKanvaProjects() {
  try {
    const rawNew = localStorage.getItem('persist:kanva-editor')
    if (rawNew) {
      const parsed = JSON.parse(rawNew)
      if (parsed.savedTemplates) {
        const templates = JSON.parse(parsed.savedTemplates)
        if (Array.isArray(templates)) return templates
      }
    }
  } catch (e) {
    console.error("Error parsing persist:kanva-editor:", e)
  }

  try {
    const rawOld = localStorage.getItem('persist:root')
    if (rawOld) {
      const root = JSON.parse(rawOld)
      const editor = JSON.parse(root.editor || '{}')
      return Array.isArray(editor.savedTemplates) ? editor.savedTemplates : []
    }
  } catch {}

  return []
}

/**
 * Delete a project by id from Kanva's localStorage.
 */
export function deleteKanvaProject(id) {
  try {
    const rawNew = localStorage.getItem('persist:kanva-editor')
    if (rawNew) {
      const parsed = JSON.parse(rawNew)
      if (parsed.savedTemplates) {
        const templates = JSON.parse(parsed.savedTemplates)
        if (Array.isArray(templates)) {
          const filtered = templates.filter((t) => String(t.id) !== String(id))
          parsed.savedTemplates = JSON.stringify(filtered)
          localStorage.setItem('persist:kanva-editor', JSON.stringify(parsed))
        }
      }
    }
  } catch {}

  try {
    const rawOld = localStorage.getItem('persist:root')
    if (rawOld) {
      const root = JSON.parse(rawOld)
      const editor = JSON.parse(root.editor || '{}')
      editor.savedTemplates = (editor.savedTemplates || []).filter(
        (t) => String(t.id) !== String(id)
      )
      root.editor = JSON.stringify(editor)
      localStorage.setItem('persist:root', JSON.stringify(root))
    }
  } catch {}
}

