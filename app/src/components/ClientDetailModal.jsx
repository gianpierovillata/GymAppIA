import { useEffect, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '../api/client.js'

const formatDate = (value) => value?.slice(0, 10) ?? '—'

const fmt = (value, digits = 1) =>
  value == null ? '—' : Number(value).toFixed(digits)

const today = () => new Date().toISOString().slice(0, 10)

const initials = (firstName = '', lastName = '') =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

export default function ClientDetailModal({ clientId, onClose, onUpdated }) {
  const [client, setClient] = useState(null)
  const [trainers, setTrainers] = useState([])
  const [measurements, setMeasurements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [assigning, setAssigning] = useState(false)
  const [selectedTrainer, setSelectedTrainer] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')
  const [measureModal, setMeasureModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    const [clientRes, trainersRes, measRes] = await Promise.allSettled([
      apiGet(`/clients/${clientId}`),
      apiGet('/trainers'),
      apiGet(`/clients/${clientId}/measurements`),
    ])

    if (clientRes.status === 'rejected') {
      setError(clientRes.reason.message)
      setLoading(false)
      return
    }

    setClient(clientRes.value)
    setTrainers(trainersRes.status === 'fulfilled' ? trainersRes.value : [])
    setMeasurements(measRes.status === 'fulfilled' ? measRes.value : [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  const showToast = (type, message) => setToast({ type, message })

  const assignTrainer = async (trainerId) => {
    setAssigning(true)
    try {
      const updated = await apiPut(`/clients/${clientId}/personal-trainer`, { trainerId })
      setClient(updated)
      setSelectedTrainer('')
      setAssigning(false)
      showToast('success', updated.trainerId ? 'Entrenador asignado.' : 'Entrenador quitado.')
      onUpdated?.()
    } catch (err) {
      setAssigning(false)
      showToast('error', err.message)
    }
  }

  const handleDeleteMeasurement = async () => {
    try {
      await apiDelete(`/clients/${clientId}/measurements/${deleteTarget.id}`)
      setDeleteTarget(null)
      showToast('success', 'Medición eliminada.')
      setMeasurements((list) => list.filter((m) => m.id !== deleteTarget.id))
      onUpdated?.()
    } catch (err) {
      setDeleteTarget(null)
      showToast('error', err.message)
    }
  }

  const activeTrainers = trainers.filter((t) => t.isActive)
  const specialties = [...new Set(activeTrainers.map((t) => t.specialty).filter(Boolean))].sort(
    (a, b) => (b === 'Musculación') - (a === 'Musculación'),
  )
  const filteredTrainers = specialtyFilter
    ? activeTrainers.filter((t) => t.specialty === specialtyFilter)
    : activeTrainers
  const latest = measurements[0]
  const bmi =
    latest?.weightKg && latest?.heightCm
      ? latest.weightKg / ((latest.heightCm / 100) ** 2)
      : null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{client ? `${client.firstName} ${client.lastName}` : 'Ficha del cliente'}</h3>
          <button className="icon-btn" onClick={onClose}>
            <XIcon />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="banner warning">
              <p>{error}</p>
            </div>
          )}

          {loading && <p className="empty-state">Cargando ficha...</p>}

          {!loading && !error && client && (
            <>
              <div className="detail-header">
                <span className="avatar avatar-lg">{initials(client.firstName, client.lastName)}</span>
                <div>
                  <div className="cell-name">{client.email}</div>
                  <div className="cell-muted">
                    {client.phone || 'Sin teléfono'} · Nac. {formatDate(client.birthDate)} ·{' '}
                    {client.address || 'Sin dirección'}
                  </div>
                </div>
                <span className={`badge ${client.isActive ? 'green' : 'amber'}`}>
                  {client.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="detail-section">
                <div className="detail-section-head">
                  <h4>Entrenador personal</h4>
                  {!assigning &&
                    (client.trainerId ? (
                      <div className="detail-actions">
                        <button className="btn btn-ghost" onClick={() => setAssigning(true)}>
                          Cambiar
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => assignTrainer(null)}
                          disabled={assigning}
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <button className="btn btn-ghost" onClick={() => setAssigning(true)}>
                        Asignar
                      </button>
                    ))}
                </div>

                {assigning ? (
                  <div className="assign-panel">
                    <div className="assign-row">
                      <span className="assign-label">Especialidad:</span>
                      <select
                        className="input select filter"
                        value={specialtyFilter}
                        onChange={(e) => {
                          setSpecialtyFilter(e.target.value)
                          setSelectedTrainer('')
                        }}
                      >
                        <option value="">Todas</option>
                        {specialties.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="assign-row">
                      <select
                        className="input select"
                        value={selectedTrainer}
                        onChange={(e) => setSelectedTrainer(e.target.value)}
                      >
                        <option value="">Seleccionar entrenador...</option>
                        {filteredTrainers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.firstName} {t.lastName}
                            {t.specialty ? ` · ${t.specialty}` : ''}
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn btn-primary"
                        disabled={!selectedTrainer || assigning}
                        onClick={() => assignTrainer(selectedTrainer)}
                      >
                        Guardar
                      </button>
                      <button className="btn btn-ghost" onClick={() => setAssigning(false)}>
                        Cancelar
                      </button>
                    </div>
                    {filteredTrainers.length === 0 && (
                      <p className="empty-state">
                        No hay entrenadores activos con esa especialidad.
                      </p>
                    )}
                  </div>
                ) : client.trainerId ? (
                  <div className="trainer-card">
                    <span className="avatar">{initials(client.trainerName?.split(' ')[0], client.trainerName?.split(' ')[1])}</span>
                    <div className="list-main">
                      <div className="list-title">{client.trainerName}</div>
                      <div className="list-meta">Entrenador personal asignado</div>
                    </div>
                  </div>
                ) : (
                  <p className="empty-state">Sin entrenador personal asignado.</p>
                )}
              </div>

              <div className="detail-section">
                <div className="detail-section-head">
                  <h4>Datos corporales</h4>
                  <button className="btn btn-ghost" onClick={() => setMeasureModal({ mode: 'create' })}>
                    <PlusIcon />
                    Registrar medición
                  </button>
                </div>

                {measurements.length === 0 ? (
                  <p className="empty-state">Sin mediciones registradas.</p>
                ) : (
                  <>
                    <div className="metric-grid">
                      <MetricTile label="Peso" value={fmt(latest.weightKg, 2)} unit="kg" />
                      <MetricTile label="Altura" value={fmt(latest.heightCm, 1)} unit="cm" />
                      <MetricTile label="IMC" value={bmi ? bmi.toFixed(1) : '—'} unit="kg/m²" />
                      <MetricTile label="Grasa corporal" value={fmt(latest.bodyFatPercentage, 1)} unit="%" />
                      <MetricTile label="Masa muscular" value={fmt(latest.muscleMassKg, 2)} unit="kg" />
                      <MetricTile label="Cintura" value={fmt(latest.waistCm, 1)} unit="cm" />
                    </div>

                    <div className="table-wrap">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Peso</th>
                            <th>Grasa</th>
                            <th>Masa</th>
                            <th>Cintura</th>
                            <th>Obs.</th>
                            <th className="th-actions">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {measurements.map((m) => (
                            <tr key={m.id}>
                              <td>{formatDate(m.measuredOn)}</td>
                              <td>{fmt(m.weightKg, 2)} kg</td>
                              <td>{fmt(m.bodyFatPercentage, 1)}%</td>
                              <td>{fmt(m.muscleMassKg, 2)} kg</td>
                              <td>{fmt(m.waistCm, 1)} cm</td>
                              <td className="cell-muted">{m.notes || '—'}</td>
                              <td className="td-actions">
                                <button
                                  className="icon-btn"
                                  title="Editar"
                                  onClick={() => setMeasureModal({ mode: 'edit', measurement: m })}
                                >
                                  <EditIcon />
                                </button>
                                <button
                                  className="icon-btn danger"
                                  title="Eliminar"
                                  onClick={() => setDeleteTarget(m)}
                                >
                                  <TrashIcon />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      {measureModal && (
        <MeasurementFormModal
          mode={measureModal.mode}
          measurement={measureModal.measurement}
          clientId={clientId}
          onClose={() => setMeasureModal(null)}
          onSaved={(message) => {
            setMeasureModal(null)
            showToast('success', message)
            load()
            onUpdated?.()
          }}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Eliminar medición</h3>
              <button className="icon-btn" onClick={() => setDeleteTarget(null)}>
                <XIcon />
              </button>
            </div>
            <div className="modal-body">
              <p>
                ¿Estás seguro de que querés eliminar la medición del{' '}
                <strong>{formatDate(deleteTarget.measuredOn)}</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleDeleteMeasurement}>
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
    </div>
  )
}

function MetricTile({ label, value, unit }) {
  return (
    <div className="metric-tile">
      <div className="metric-value">
        {value} <span className="metric-unit">{unit}</span>
      </div>
      <div className="metric-label">{label}</div>
    </div>
  )
}

function MeasurementFormModal({ mode, measurement, clientId, onClose, onSaved }) {
  const isEdit = mode === 'edit'
  const [form, setForm] = useState(
    isEdit
      ? {
          measuredOn: measurement.measuredOn,
          weightKg: measurement.weightKg ?? '',
          heightCm: measurement.heightCm ?? '',
          bodyFatPercentage: measurement.bodyFatPercentage ?? '',
          muscleMassKg: measurement.muscleMassKg ?? '',
          waistCm: measurement.waistCm ?? '',
          notes: measurement.notes ?? '',
        }
      : {
          measuredOn: today(),
          weightKg: '',
          heightCm: '',
          bodyFatPercentage: '',
          muscleMassKg: '',
          waistCm: '',
          notes: '',
        },
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const setField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const toNumberOrNull = (value) => {
    if (value === '' || value == null) return null
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      measuredOn: form.measuredOn,
      weightKg: toNumberOrNull(form.weightKg),
      heightCm: toNumberOrNull(form.heightCm),
      bodyFatPercentage: toNumberOrNull(form.bodyFatPercentage),
      muscleMassKg: toNumberOrNull(form.muscleMassKg),
      waistCm: toNumberOrNull(form.waistCm),
      notes: form.notes.trim() || null,
    }

    try {
      if (isEdit) {
        await apiPut(`/clients/${clientId}/measurements/${measurement.id}`, payload)
        onSaved('Medición actualizada.')
      } else {
        await apiPost(`/clients/${clientId}/measurements`, payload)
        onSaved('Medición registrada.')
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
            <h3>{isEdit ? 'Editar medición' : 'Registrar medición'}</h3>
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
                <label htmlFor="measuredOn">Fecha *</label>
                <input
                  id="measuredOn"
                  type="date"
                  className="input"
                  value={form.measuredOn}
                  onChange={setField('measuredOn')}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="weightKg">Peso (kg)</label>
                <input
                  id="weightKg"
                  type="number"
                  step="0.1"
                  min="20"
                  max="500"
                  className="input"
                  value={form.weightKg}
                  onChange={setField('weightKg')}
                  placeholder="82.5"
                />
              </div>

              <div className="form-field">
                <label htmlFor="heightCm">Altura (cm)</label>
                <input
                  id="heightCm"
                  type="number"
                  step="0.1"
                  min="50"
                  max="250"
                  className="input"
                  value={form.heightCm}
                  onChange={setField('heightCm')}
                  placeholder="175"
                />
              </div>

              <div className="form-field">
                <label htmlFor="bodyFatPercentage">% Grasa corporal</label>
                <input
                  id="bodyFatPercentage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="75"
                  className="input"
                  value={form.bodyFatPercentage}
                  onChange={setField('bodyFatPercentage')}
                  placeholder="18.2"
                />
              </div>

              <div className="form-field">
                <label htmlFor="muscleMassKg">Masa muscular (kg)</label>
                <input
                  id="muscleMassKg"
                  type="number"
                  step="0.1"
                  min="10"
                  max="300"
                  className="input"
                  value={form.muscleMassKg}
                  onChange={setField('muscleMassKg')}
                  placeholder="35.4"
                />
              </div>

              <div className="form-field">
                <label htmlFor="waistCm">Cintura (cm)</label>
                <input
                  id="waistCm"
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  className="input"
                  value={form.waistCm}
                  onChange={setField('waistCm')}
                  placeholder="88"
                />
              </div>

              <div className="form-field form-field-full">
                <label htmlFor="notes">Observaciones</label>
                <textarea
                  id="notes"
                  className="input"
                  rows="2"
                  maxLength={500}
                  value={form.notes}
                  onChange={setField('notes')}
                  placeholder="Notas de la medición..."
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar'}
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
