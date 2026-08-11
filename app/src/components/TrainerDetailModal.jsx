import { useEffect, useState } from 'react'
import { apiGet } from '../api/client.js'

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

const initials = (firstName = '', lastName = '') =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

export default function TrainerDetailModal({ trainer, onClose }) {
  const [clients, setClients] = useState(null)
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    Promise.allSettled([
      apiGet(`/trainers/${trainer.id}/clients`),
      apiGet('/trainershifts'),
    ]).then(([clientsRes, shiftsRes]) => {
      if (!active) return
      if (clientsRes.status === 'rejected') {
        setError(clientsRes.reason.message)
      } else {
        setClients(clientsRes.value)
      }
      setShifts(
        shiftsRes.status === 'fulfilled'
          ? shiftsRes.value.filter((s) => s.trainerId === trainer.id)
          : [],
      )
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [trainer.id])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Ficha del entrenador</h3>
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

          <div className="detail-header">
            <span className="avatar avatar-lg">{initials(trainer.firstName, trainer.lastName)}</span>
            <div>
              <div className="cell-name">
                {trainer.firstName} {trainer.lastName}
              </div>
              <div className="cell-muted">
                {trainer.email} · {trainer.phone || 'Sin teléfono'}
              </div>
            </div>
            <span className={`badge ${trainer.isActive ? 'green' : 'amber'}`}>
              {trainer.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <div className="detail-section">
            <div className="detail-section-head">
              <h4>Especialidad</h4>
            </div>
            <p className="empty-state">
              {trainer.specialty ? (
                <span className="badge indigo">{trainer.specialty}</span>
              ) : (
                'Sin especialidad declarada.'
              )}
            </p>
          </div>

          <div className="detail-section">
            <div className="detail-section-head">
              <h4>Clientes asignados</h4>
              <span className="table-count">{loading ? '…' : clients?.length ?? 0}</span>
            </div>

            {loading ? (
              <p className="empty-state">Cargando clientes...</p>
            ) : !clients || clients.length === 0 ? (
              <p className="empty-state">
                Sin clientes asignados. Asignale clientes desde la ficha del cliente.
              </p>
            ) : (
              <ul className="list">
                {clients.map((c) => (
                  <li key={c.id}>
                    <span className="avatar">{initials(c.firstName, c.lastName)}</span>
                    <div className="list-main">
                      <div className="list-title">
                        {c.firstName} {c.lastName}
                      </div>
                      <div className="list-meta">
                        {c.email} · {c.phone || 'Sin teléfono'}
                      </div>
                    </div>
                    <span className={`badge ${c.isActive ? 'green' : 'amber'}`}>
                      {c.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="detail-section">
            <div className="detail-section-head">
              <h4>Turnos de trabajo</h4>
              <span className="table-count">{shifts.length}</span>
            </div>

            {shifts.length === 0 ? (
              <p className="empty-state">Sin turnos cargados. Gestionalos desde el módulo Turnos.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Día</th>
                      <th>Desde</th>
                      <th>Hasta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map((s) => (
                      <tr key={s.id}>
                        <td>{DAY_LABEL[s.dayOfWeek] ?? s.dayOfWeek}</td>
                        <td>{formatTime(s.startTime)}</td>
                        <td>{formatTime(s.endTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
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
