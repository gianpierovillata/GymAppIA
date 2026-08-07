const stats = [
  {
    label: 'Clientes activos',
    value: '128',
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
    label: 'Entrenadores',
    value: '14',
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
    label: 'Clases semanales',
    value: '23',
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
    label: 'Planes activos',
    value: '6',
    tone: 'amber',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 12L2 9z" />
        <path d="M2 9h20" />
        <path d="M9 3l3 6 3-6" />
      </svg>
    ),
  },
]

const todayClasses = [
  { time: '08:00', name: 'Spinning', trainer: 'María López', room: 'Sala Spinning' },
  { time: '10:00', name: 'Funcional', trainer: 'Carlos Ruiz', room: 'Salón Principal' },
  { time: '12:00', name: 'Yoga', trainer: 'Ana Pérez', room: 'Salón 2' },
  { time: '18:00', name: 'Spinning', trainer: 'Jorge Díaz', room: 'Sala Spinning' },
]

const modules = [
  { name: 'Clientes', desc: 'Altas, datos de contacto y planes asignados.' },
  { name: 'Entrenadores', desc: 'Perfil, especialidad y turnos de trabajo.' },
  { name: 'Clases', desc: 'Salón, spinning y otras actividades.' },
  { name: 'Horarios', desc: 'Días y franjas de cada clase y entrenador.' },
  { name: 'Planes', desc: 'Membresías ofrecidas y asignación a clientes.' },
]

export default function Dashboard() {
  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Resumen general del gimnasio.</p>
        </div>
      </div>

      <div className="banner info">
        <p>
          Vista previa con datos de ejemplo. Los valores se conectarán a la API cuando el backend
          esté listo.
        </p>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <span className={`stat-icon ${s.tone}`}>{s.icon}</span>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Clases de hoy</h3>
          <p className="card-sub">Próximas sesiones programadas.</p>
          <ul className="list">
            {todayClasses.map((c) => (
              <li key={`${c.time}-${c.name}`}>
                <span className="badge indigo">{c.time}</span>
                <div className="list-main">
                  <div className="list-title">{c.name}</div>
                  <div className="list-meta">
                    {c.trainer} · {c.room}
                  </div>
                </div>
              </li>
            ))}
          </ul>
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
