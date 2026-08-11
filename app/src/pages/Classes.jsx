import { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '../api/client.js'

const EMPTY_FORM = {
  name: '',
  category: 'Studio',
  description: '',
  durationMinutes: '60',
  capacity: '15',
}

const CATEGORY_LABELS = {
  Studio: 'Salón',
  Spinning: 'Spinning',
  Other: 'Otras',
}

const CATEGORY_BADGES = {
  Studio: 'indigo',
  Spinning: 'green',
  Other: 'amber',
}

const initials = (name = '') =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()

export default function Classes() {
  const [classes, setClasses] = useState(null)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const loadClasses = async () => {
    setError(null)
    setClasses(null)
    try {
      setClasses(await apiGet('/classes'))
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  const filtered = useMemo(() => {
    if (!classes) return []
    const term = search.trim().toLowerCase()
    if (!term) return classes
    return classes.filter((c) =>
      `${c.name} ${c.description ?? ''} ${CATEGORY_LABELS[c.category] ?? c.category}`
        .toLowerCase()
        .includes(term),
    )
  }, [classes, search])

  const handleSaved = (message) => {
    setModal(null)
    setToast({ type: 'success', message })
    loadClasses()
  }

  const handleDelete = async () => {
    try {
      await apiDelete(`/classes/${deleteTarget.id}`)
      setDeleteTarget(null)
      setToast({ type: 'success', message: `Clase "${deleteTarget.name}" eliminada.` })
      loadClasses()
    } catch (err) {
      setDeleteTarget(null)
      setToast({ type: 'error', message: err.message })
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Clases</h2>
          <p>Catálogo de actividades grupales, duración y capacidad.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
          <PlusIcon />
          Nueva clase
        </button>
      </div>

      {error && (
        <div className="banner warning">
          <p>No se pudo cargar la lista: {error}</p>
          <button className="btn btn-ghost" onClick={loadClasses}>
            Reintentar
          </button>
        </div>
      )}

      {classes === null && !error && (
        <div className="card">
          <p className="empty-state">Cargando clases...</p>
        </div>
      )}

      {classes && (
        <div className="card">
          <div className="toolbar">
            <div className="search-box">
              <SearchIcon />
              <input
                type="search"
                className="input"
                placeholder="Buscar por nombre, categoría o descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="table-count">
              {filtered.length} de {classes.length}
            </span>
          </div>

          {filtered.length === 0 ? (
            <p className="empty-state">
              {search ? `No hay resultados para "${search}".` : 'No hay clases registradas.'}
            </p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Clase</th>
                    <th>Categoría</th>
                    <th>Duración</th>
                    <th>Capacidad</th>
                    <th>Estado</th>
                    <th className="th-actions">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className={c.isActive ? '' : 'row-inactive'}>
                      <td>
                        <div className="cell-client">
                          <span className="avatar">{initials(c.name)}</span>
                          <div>
                            <div className="cell-name">{c.name}</div>
                            <div className="cell-muted">{c.description || 'Sin descripción'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${CATEGORY_BADGES[c.category] ?? 'indigo'}`}>
                          {CATEGORY_LABELS[c.category] ?? c.category}
                        </span>
                      </td>
                      <td>{c.durationMinutes} min</td>
                      <td>{c.capacity} personas</td>
                      <td>
                        <span className={`badge ${c.isActive ? 'green' : 'amber'}`}>
                          {c.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="td-actions">
                        <button
                          className="icon-btn"
                          title="Editar"
                          onClick={() => setModal({ mode: 'edit', classActivity: c })}
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="icon-btn danger"
                          title="Eliminar"
                          onClick={() => setDeleteTarget(c)}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modal && (
        <ClassFormModal
          mode={modal.mode}
          classActivity={modal.classActivity}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Eliminar clase</h3>
              <button className="icon-btn" onClick={() => setDeleteTarget(null)}>
                <XIcon />
              </button>
            </div>
            <div className="modal-body">
              <p>
                ¿Estás seguro de que querés eliminar la clase{' '}
                <strong>{deleteTarget.name}</strong>? Esta acción la desactiva (soft-delete).
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                <TrashIcon />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckIcon /> : <AlertIcon />}
          <span>{toast.message}</span>
        </div>
      )}
    </section>
  )
}

function ClassFormModal({ mode, classActivity, onClose, onSaved }) {
  const isEdit = mode === 'edit'
  const [form, setForm] = useState(
    isEdit
      ? {
          name: classActivity.name,
          category: classActivity.category,
          description: classActivity.description ?? '',
          durationMinutes: String(classActivity.durationMinutes),
          capacity: String(classActivity.capacity),
        }
      : EMPTY_FORM,
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const setField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim() || null,
      durationMinutes: Number(form.durationMinutes),
      capacity: Number(form.capacity),
    }

    try {
      if (isEdit) {
        await apiPut(`/classes/${classActivity.id}`, payload)
        onSaved('Clase actualizada correctamente.')
      } else {
        await apiPost('/classes', payload)
        onSaved('Clase creada correctamente.')
      }
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h3>{isEdit ? 'Editar clase' : 'Nueva clase'}</h3>
            <button type="button" className="icon-btn" onClick={onClose}>
              <XIcon />
            </button>
          </div>

          <div className="modal-body">
            {error && (
              <div className="banner warning">
                <p>{error}</p>
              </div>
            )}

            <div className="form-grid">
              <div className="form-field form-field-full">
                <label htmlFor="className">Nombre *</label>
                <input
                  id="className"
                  className="input"
                  value={form.name}
                  onChange={setField('name')}
                  required
                  maxLength={100}
                  placeholder="Ej: Spinning Express"
                />
              </div>

              <div className="form-field">
                <label htmlFor="category">Categoría *</label>
                <select
                  id="category"
                  className="input"
                  value={form.category}
                  onChange={setField('category')}
                >
                  <option value="Studio">Salón</option>
                  <option value="Spinning">Spinning</option>
                  <option value="Other">Otras</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="durationMinutes">Duración (minutos) *</label>
                <input
                  id="durationMinutes"
                  type="number"
                  className="input"
                  value={form.durationMinutes}
                  onChange={setField('durationMinutes')}
                  required
                  min="1"
                  max="600"
                />
              </div>

              <div className="form-field form-field-full">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  className="input"
                  rows="3"
                  value={form.description}
                  onChange={setField('description')}
                  maxLength={500}
                  placeholder="Detalle de la clase..."
                />
              </div>

              <div className="form-field">
                <label htmlFor="capacity">Capacidad (personas) *</label>
                <input
                  id="capacity"
                  type="number"
                  className="input"
                  value={form.capacity}
                  onChange={setField('capacity')}
                  required
                  min="1"
                  max="500"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear clase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}
