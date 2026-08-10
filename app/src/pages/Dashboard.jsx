import { useEffect, useState } from 'react'
import { apiGet } from '../api/client.js'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const STAT_CARDS = [
  {
    key: 'clients',
    label: 'Clientes activos',
    tone: 'indigo',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: 'trainers',
    label: 'Entrenadores activos',
    tone: 'cyan',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 20h12" />
        <path d="M8 20V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14" />
        <path d="M10 8h4" />
      </svg>
    ),
  },
  {
    key: 'classes',
    label: 'Clases',
    tone: 'green',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M12 3v4" />
        <path d="M4 7h16l-2 4H6z" />
      </svg>
    ),
  },
  {
    key: 'schedules',
    label: 'Clases programadas',
    tone: 'amber',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
]

const modules = [
  { name: 'Clientes', desc: 'Altas, datos de contacto y planes asignados.' },
  { name: 'Entrenadores', desc: 'Perfil, especialidad y turnos de trabajo.' },
  { name: 'Clases', desc: 'Salón, spinning y otras actividades.' },
  { name: 'Horarios', desc: 'Días y franjas de cada clase y entrenador.' },
  { name: 'Planes', desc: 'Membresías ofrecidas y asignación a clientes.' },
]

const formatTime = (time) => time?.slice(0, 5) ?? '--:--'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    Promise.allSettled([
      apiGet('/clients'),
      apiGet('/trainers'),
      apiGet('/classes'),
      apiGet('/schedules'),
      apiGet('/trainershifts'),
    ]).then((results) => {
      if (!active) return

      const values = results.map((r) => (r.status === 'fulfilled' ? r.value : []))

      if (results.every((r) => r.status === 'rejected')) {
        setError('la API no responde')
        return
      }

      setData({
        clients: values[0],
        trainers: values[1],
        classes: values[2],
        schedules: values[3],
        shifts: values[4],
      })
    })

    return () => {
      active = false
    }
  }, [])

  const todayName = DAY_NAMES[new Date().getDay()]

  const activeOf = (items) => (items ?? []).filter((i) => i.isActive).length

  const stats = data
    ? {
        clients: activeOf(data.clients),
        trainers: activeOf(data.trainers),
        classes: activeOf(data.classes),
        schedules: activeOf(data.schedules),
      }
    : { clients: '…', trainers: '…', classes: '…', schedules: '…' }

  const todayClasses = (data?.schedules ?? []).filter(
    (s) => s.isActive && s.dayOfWeek === todayName,
  )

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Resumen general del gimnasio.</p>
        </div>
      </div>

      {error && (
        <div className="banner warning">
          <p>No se pudo conectar con la API: {error}</p>
        </div>
      )}

      <div className="stats-grid">
        {STAT_CARDS.map((s) => (
          <div key={s.key} className="stat-card">
            <span className={`stat-icon ${s.tone}`}>{s.icon}</span>
            <div>
              <div className="stat-value">{stats[s.key]}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Clases de hoy</h3>
          <p className="card-sub">{todayName}. Sesiones programadas para este día.</p>
          {todayClasses.length === 0 ? (
            <p className="empty-state">No hay clases programadas para hoy.</p>
          ) : (
            <ul className="list">
              {todayClasses
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((c) => (
                  <li key={c.id}>
                    <span className="badge indigo">{formatTime(c.startTime)}</span>
                    <div className="list-main">
                      <div className="list-title">{c.classActivityName}</div>
                      <div className="list-meta">
                        {c.trainerName} · {c.room ?? 'Sin salón'} · hasta{' '}
                        {formatTime(c.endTime)}
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3>Módulos del sistema</h3>
          <p className="card-sub">Gestión de cada área del gimnasio.</p>
          <ul className="list">
            {modules.map((m) => (
              <li key={m.name}>
                <span className="avatar">{m.name.charAt(0)}</span>
                <div className="list-main">
                  <div className="list-title">{m.name}</div>
                  <div className="list-meta">{m.desc}</div>
                </div>
                <span className="badge green">Activo</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
