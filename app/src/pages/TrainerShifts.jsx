import { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '../api/client.js'
import SearchSelect from '../components/SearchSelect.jsx'

const DAYS = [
  { value: 'Monday', label: 'Lunes' },
  { value: 'Tuesday', label: 'Martes' },
  { value: 'Wednesday', label: 'Miércoles' },
  { value: 'Thursday', label: 'Jueves' },
  { value: 'Friday', label: 'Viernes' },
  { value: 'Saturday', label: 'Sábado' },
  { value: 'Sunday', label: 'Domingo' },
]

const DAY_LABEL = Object.fromEntries(DAYS.map((d) => [d.value, d.label]))

const formatTime = (time) => time?.slice(0, 5) ?? '--:--'

const toTimeInput = (time) => time?.slice(0, 5) ?? ''

export default function TrainerShifts() {
  const [shifts, setShifts] = useState(null)
  const [trainers, setTrainers] = useState([])
  const [error, setError] = useState(null)
  const [filterTrainer, setFilterTrainer] = useState('')
  const [filterDay, setFilterDay] = useState('')
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const load = async () => {
    setError(null)
    setShifts(null)
    try {
      const [shiftsRes, trainersRes] = await Promise.all([
        apiGet('/trainershifts'),
        apiGet('/trainers'),
      ])
      setShifts(shiftsRes)
      setTrainers(trainersRes)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  const activeShifts = useMemo(() => (shifts ?? []).filter((s) => s.isActive), [shifts])

  const filtered = useMemo(() => {
    return activeShifts.filter(
      (s) =>
        (!filterTrainer || s.trainerId === filterTrainer) &&
        (!filterDay || s.dayOfWeek === filterDay),
    )
  }, [activeShifts, filterTrainer, filterDay])

  const activeTrainers = trainers.filter((t) => t.isActive)

  const trainerOptions = useMemo(
    () =>
      trainers.map((t) => ({
        value: t.id,
        label: `${t.firstName} ${t.lastName}`,
        hint: [t.specialty, t.isActive ? null : 'inactivo'].filter(Boolean).join(' · '),
      })),
    [trainers],
  )

  const handleSaved = (message) => {
    setModal(null)
    setToast({ type: 'success', message })
    load()
  }

  const handleDelete = async () => {
    try {
      await apiDelete(`/trainershifts/${deleteTarget.id}`)
      setDeleteTarget(null)
      setToast({ type: 'success', message: 'Turno eliminado.' })
      load()
    } catch (err) {
      setDeleteTarget(null)
      setToast({ type: 'error', message: err.message })
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Turnos de trabajo</h2>
          <p>Franjas horarias de disponibilidad de cada entrenador.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
          <PlusIcon />
          Nuevo turno
        </button>
      </div>

      {error && (
        <div className="banner warning">
          <p>No se pudo cargar la lista: {error}</p>
          <button className="btn btn-ghost" onClick={load}>
            Reintentar
          </button>
        </div>
      )}

      {shifts === null && !error && (
        <div className="card">
          <p className="empty-state">Cargando turnos...</p>
        </div>
      )}

      {shifts && (
        <div className="card">
          <div className="toolbar">
            <div className="filters">
              <SearchSelect
                className="filter-combobox"
                items={trainerOptions}
                value={filterTrainer}
                onChange={setFilterTrainer}
                placeholder="Todos los entrenadores"
                emptyText="Ningún entrenador coincide"
                ariaLabel="Filtrar turnos por entrenador"
                clearable
                clearLabel="Quitar filtro de entrenador"
              />
              <select
                className="input select filter"
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
              >
                <option value="">Todos los días</option>
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <span className="table-count">
              {filtered.length} de {activeShifts.length}
            </span>
          </div>

          {filtered.length === 0 ? (
            <p className="empty-state">No hay turnos con los filtros seleccionados.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Entrenador</th>
                    <th>Día</th>
                    <th>Desde</th>
                    <th>Hasta</th>
                    <th className="th-actions">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="cell-name">{s.trainerName}</div>
                      </td>
                      <td>{DAY_LABEL[s.dayOfWeek] ?? s.dayOfWeek}</td>
                      <td>{formatTime(s.startTime)}</td>
                      <td>{formatTime(s.endTime)}</td>
                      <td className="td-actions">
                        <button
                          className="icon-btn"
                          title="Editar"
                          onClick={() => setModal({ mode: 'edit', shift: s })}
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="icon-btn danger"
                          title="Eliminar"
                          onClick={() => setDeleteTarget(s)}
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
        <ShiftFormModal
          mode={modal.mode}
          shift={modal.shift}
          trainers={activeTrainers}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Eliminar turno</h3>
              <button className="icon-btn" onClick={() => setDeleteTarget(null)}>
                <XIcon />
              </button>
            </div>
            <div className="modal-body">
              <p>
                ¿Estás seguro de que querés eliminar el turno de{' '}
                <strong>{deleteTarget.trainerName}</strong> ({DAY_LABEL[deleteTarget.dayOfWeek]}{' '}
                {formatTime(deleteTarget.startTime)} – {formatTime(deleteTarget.endTime)})?
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

function ShiftFormModal({ mode, shift, trainers, onClose, onSaved }) {
  const isEdit = mode === 'edit'
  const [form, setForm] = useState(
    isEdit
      ? {
          trainerId: shift.trainerId,
          dayOfWeek: shift.dayOfWeek,
          startTime: toTimeInput(shift.startTime),
          endTime: toTimeInput(shift.endTime),
        }
      : {
          trainerId: '',
          dayOfWeek: 'Monday',
          startTime: '09:00',
          endTime: '13:00',
        },
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const trainerOptions = trainers.map((t) => ({
    value: t.id,
    label: `${t.firstName} ${t.lastName}`,
    hint: t.specialty ?? '',
  }))

  const setField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.trainerId) {
      setError('Seleccioná un entrenador.')
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      trainerId: form.trainerId,
      dayOfWeek: form.dayOfWeek,
      startTime: `${form.startTime}:00`,
      endTime: `${form.endTime}:00`,
    }

    try {
      if (isEdit) {
        await apiPut(`/trainershifts/${shift.id}`, payload)
        onSaved('Turno actualizado correctamente.')
      } else {
        await apiPost('/trainershifts', payload)
        onSaved('Turno creado correctamente.')
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
            <h3>{isEdit ? 'Editar turno' : 'Nuevo turno'}</h3>
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
                <label htmlFor="trainerId">Entrenador *</label>
                <SearchSelect
                  id="trainerId"
                  items={trainerOptions}
                  value={form.trainerId}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, trainerId: value }))
                  }
                  placeholder="Buscar entrenador..."
                  emptyText="Ningún entrenador coincide"
                  ariaLabel="Entrenador del turno"
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label htmlFor="dayOfWeek">Día *</label>
                <select
                  id="dayOfWeek"
                  className="input select"
                  value={form.dayOfWeek}
                  onChange={setField('dayOfWeek')}
                >
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="startTime">Desde *</label>
                <input
                  id="startTime"
                  type="time"
                  className="input"
                  value={form.startTime}
                  onChange={setField('startTime')}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="endTime">Hasta *</label>
                <input
                  id="endTime"
                  type="time"
                  className="input"
                  value={form.endTime}
                  onChange={setField('endTime')}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear turno'}
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
