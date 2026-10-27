import { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '../api/client.js'

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

const CATEGORY_TONE = {
  Studio: 'indigo',
  Spinning: 'green',
  Other: 'amber',
}

const TODAY_NAME = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
][new Date().getDay()]

const hourOf = (time) => Number(time?.slice(0, 2) ?? 0)

const padHour = (hour) => String(hour).padStart(2, '0')

const formatTime = (time) => time?.slice(0, 5) ?? '--:--'

const toTimeInput = (time) => time?.slice(0, 5) ?? ''

const initials = (name = '') =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()

export default function Schedules() {
  const [schedules, setSchedules] = useState(null)
  const [classes, setClasses] = useState([])
  const [trainers, setTrainers] = useState([])
  const [error, setError] = useState(null)
  const [filterClass, setFilterClass] = useState('')
  const [filterTrainer, setFilterTrainer] = useState('')
  const [filterDay, setFilterDay] = useState('')
  const [filterRoom, setFilterRoom] = useState('')
  const [view, setView] = useState('week')
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const load = async () => {
    setError(null)
    setSchedules(null)
    try {
      const [schedulesRes, classesRes, trainersRes] = await Promise.all([
        apiGet('/schedules'),
        apiGet('/classes'),
        apiGet('/trainers'),
      ])
      setSchedules(schedulesRes)
      setClasses(classesRes)
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

  const filtered = useMemo(() => {
    if (!schedules) return []
    return schedules.filter(
      (s) =>
        (!filterClass || s.classActivityId === filterClass) &&
        (!filterTrainer || s.trainerId === filterTrainer) &&
        (!filterDay || s.dayOfWeek === filterDay) &&
        (!filterRoom || s.room === filterRoom),
    )
  }, [schedules, filterClass, filterTrainer, filterDay, filterRoom])

  const activeSchedules = useMemo(() => filtered.filter((s) => s.isActive), [filtered])

  const rooms = useMemo(
    () =>
      [...new Set((schedules ?? []).filter((s) => s.isActive && s.room).map((s) => s.room))].sort(
        (a, b) => a.localeCompare(b),
      ),
    [schedules],
  )

  const classById = useMemo(
    () => new Map(classes.map((c) => [c.id, c])),
    [classes],
  )

  const weekDays = filterDay ? DAYS.filter((d) => d.value === filterDay) : DAYS

  const hours = useMemo(() => {
    if (activeSchedules.length === 0) {
      return Array.from({ length: 14 }, (_, i) => i + 7)
    }

    const startHours = activeSchedules.map((s) => hourOf(s.startTime))
    const from = Math.max(5, Math.min(7, ...startHours))
    const to = Math.min(23, Math.max(21, ...startHours) + 1)

    return Array.from({ length: Math.max(1, to - from) }, (_, i) => from + i)
  }, [activeSchedules])

  const weekCells = useMemo(() => {
    const cells = new Map()
    for (const schedule of activeSchedules) {
      const key = `${schedule.dayOfWeek}|${hourOf(schedule.startTime)}`
      const list = cells.get(key) ?? []
      list.push(schedule)
      cells.set(key, list)
    }
    for (const list of cells.values()) {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime))
    }
    return cells
  }, [activeSchedules])

  const activeClasses = classes.filter((c) => c.isActive)
  const activeTrainers = trainers.filter((t) => t.isActive)

  const handleSaved = (message) => {
    setModal(null)
    setToast({ type: 'success', message })
    load()
  }

  const handleDelete = async () => {
    try {
      await apiDelete(`/schedules/${deleteTarget.id}`)
      setDeleteTarget(null)
      setToast({ type: 'success', message: 'Horario eliminado.' })
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
          <h2>Horarios</h2>
          <p>Programación semanal de clases y salones.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
          <PlusIcon />
          Nuevo horario
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

      {schedules === null && !error && (
        <div className="card">
          <p className="empty-state">Cargando horarios...</p>
        </div>
      )}

      {schedules && (
        <div className="card">
          <div className="toolbar">
            <div className="toolbar-left">
              <div className="view-toggle" role="group" aria-label="Vista de horarios">
                <button
                  type="button"
                  className={view === 'week' ? 'active' : ''}
                  aria-pressed={view === 'week'}
                  onClick={() => setView('week')}
                >
                  Semana
                </button>
                <button
                  type="button"
                  className={view === 'table' ? 'active' : ''}
                  aria-pressed={view === 'table'}
                  onClick={() => setView('table')}
                >
                  Tabla
                </button>
              </div>
              <div className="filters">
                <select
                  className="input select filter"
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  <option value="">Todas las clases</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  className="input select filter"
                  value={filterTrainer}
                  onChange={(e) => setFilterTrainer(e.target.value)}
                >
                  <option value="">Todos los entrenadores</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
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
                <select
                  className="input select filter"
                  value={filterRoom}
                  onChange={(e) => setFilterRoom(e.target.value)}
                >
                  <option value="">Todos los salones</option>
                  {rooms.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <span className="table-count">
              {filtered.length} de {schedules.length}
              {view === 'week' && filtered.some((s) => !s.isActive)
                ? ' · la grilla muestra solo activos'
                : ''}
            </span>
          </div>

          {view === 'week' ? (
            <WeekGrid
              days={weekDays}
              hours={hours}
              cells={weekCells}
              classById={classById}
              onCreate={(dayOfWeek, hour) =>
                setModal({
                  mode: 'create',
                  preset: {
                    dayOfWeek,
                    startTime: `${padHour(hour)}:00`,
                    endTime: `${padHour(Math.min(hour + 1, 23))}:00`,
                  },
                })
              }
              onEdit={(schedule) => setModal({ mode: 'edit', schedule })}
            />
          ) : filtered.length === 0 ? (
            <p className="empty-state">No hay horarios con los filtros seleccionados.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Clase</th>
                    <th>Entrenador</th>
                    <th>Día</th>
                    <th>Desde</th>
                    <th>Hasta</th>
                    <th>Salón</th>
                    <th>Estado</th>
                    <th className="th-actions">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className={s.isActive ? '' : 'row-inactive'}>
                      <td>
                        <div className="cell-client">
                          <span className="avatar">{initials(s.classActivityName)}</span>
                          <div className="cell-name">{s.classActivityName}</div>
                        </div>
                      </td>
                      <td>{s.trainerName}</td>
                      <td>{DAY_LABEL[s.dayOfWeek] ?? s.dayOfWeek}</td>
                      <td>{formatTime(s.startTime)}</td>
                      <td>{formatTime(s.endTime)}</td>
                      <td>{s.room || '—'}</td>
                      <td>
                        <span className={`badge ${s.isActive ? 'green' : 'amber'}`}>
                          {s.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="td-actions">
                        <button
                          className="icon-btn"
                          title="Editar"
                          onClick={() => setModal({ mode: 'edit', schedule: s })}
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
        <ScheduleFormModal
          mode={modal.mode}
          schedule={modal.schedule}
          preset={modal.preset}
          classes={activeClasses}
          trainers={activeTrainers}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Eliminar horario</h3>
              <button className="icon-btn" onClick={() => setDeleteTarget(null)}>
                <XIcon />
              </button>
            </div>
            <div className="modal-body">
              <p>
                ¿Estás seguro de que querés eliminar el horario de{' '}
                <strong>{deleteTarget.classActivityName}</strong> ({DAY_LABEL[deleteTarget.dayOfWeek]}{' '}
                {formatTime(deleteTarget.startTime)} – {formatTime(deleteTarget.endTime)})? Esta
                acción lo desactiva (soft-delete).
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

function WeekGrid({ days, hours, cells, classById, onCreate, onEdit }) {
  const cellKey = (day, hour) => `${day}|${hour}`

  return (
    <div className="week-grid-wrap">
      <table className="week-grid">
        <thead>
          <tr>
            <th scope="col" className="week-time-col">
              Hora
            </th>
            {days.map((day) => (
              <th
                key={day.value}
                scope="col"
                className={day.value === TODAY_NAME ? 'week-col-today' : ''}
              >
                {day.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour) => (
            <tr key={hour}>
              <th scope="row" className="week-time-col">
                {padHour(hour)}:00
              </th>
              {days.map((day) => {
                const items = cells.get(cellKey(day.value, hour)) ?? []

                return (
                  <td
                    key={day.value}
                    className={
                      day.value === TODAY_NAME ? 'week-cell week-col-today' : 'week-cell'
                    }
                  >
                    {items.map((schedule) => {
                      const tone =
                        CATEGORY_TONE[classById.get(schedule.classActivityId)?.category] ??
                        'indigo'

                      return (
                        <button
                          key={schedule.id}
                          type="button"
                          className={`week-event ${tone}`}
                          onClick={() => onEdit(schedule)}
                          title={`Editar ${schedule.classActivityName} · ${schedule.trainerName}`}
                        >
                          <span className="week-event-time">
                            {formatTime(schedule.startTime)}–{formatTime(schedule.endTime)}
                          </span>
                          <span className="week-event-name">{schedule.classActivityName}</span>
                          <span className="week-event-meta">
                            {schedule.room || 'Sin salón'} · {schedule.trainerName}
                          </span>
                        </button>
                      )
                    })}
                    {items.length === 0 && (
                      <button
                        type="button"
                        className="week-empty"
                        onClick={() => onCreate(day.value, hour)}
                        title={`Agregar ${day.label} ${padHour(hour)}:00`}
                        aria-label={`Agregar horario el ${day.label} a las ${padHour(hour)}:00`}
                      >
                        <PlusIcon />
                      </button>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ScheduleFormModal({ mode, schedule, preset, classes, trainers, onClose, onSaved }) {
  const isEdit = mode === 'edit'
  const [form, setForm] = useState(
    isEdit
      ? {
          classActivityId: schedule.classActivityId,
          trainerId: schedule.trainerId,
          dayOfWeek: schedule.dayOfWeek,
          startTime: toTimeInput(schedule.startTime),
          endTime: toTimeInput(schedule.endTime),
          room: schedule.room ?? '',
        }
      : {
          classActivityId: '',
          trainerId: '',
          dayOfWeek: preset?.dayOfWeek ?? 'Monday',
          startTime: preset?.startTime ?? '09:00',
          endTime: preset?.endTime ?? '10:00',
          room: '',
        },
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
      classActivityId: form.classActivityId,
      trainerId: form.trainerId,
      dayOfWeek: form.dayOfWeek,
      startTime: `${form.startTime}:00`,
      endTime: `${form.endTime}:00`,
      room: form.room.trim() || null,
    }

    try {
      if (isEdit) {
        await apiPut(`/schedules/${schedule.id}`, payload)
        onSaved('Horario actualizado correctamente.')
      } else {
        await apiPost('/schedules', payload)
        onSaved('Horario creado correctamente.')
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
            <h3>{isEdit ? 'Editar horario' : 'Nuevo horario'}</h3>
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
                <label htmlFor="classActivityId">Clase *</label>
                <select
                  id="classActivityId"
                  className="input select"
                  value={form.classActivityId}
                  onChange={setField('classActivityId')}
                  required
                >
                  <option value="">Seleccionar clase...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field form-field-full">
                <label htmlFor="trainerId">Entrenador *</label>
                <select
                  id="trainerId"
                  className="input select"
                  value={form.trainerId}
                  onChange={setField('trainerId')}
                  required
                >
                  <option value="">Seleccionar entrenador...</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                      {t.specialty ? ` · ${t.specialty}` : ''}
                    </option>
                  ))}
                </select>
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

              <div className="form-field">
                <label htmlFor="room">Salón</label>
                <input
                  id="room"
                  className="input"
                  value={form.room}
                  onChange={setField('room')}
                  maxLength={100}
                  placeholder="Ej: Sala A"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear horario'}
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
