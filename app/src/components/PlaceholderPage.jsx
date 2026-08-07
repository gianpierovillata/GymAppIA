export default function PlaceholderPage({ title, subtitle, features }) {
  return (
    <section>
      <div className="page-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <button className="btn btn-primary" disabled>
          Agregar
        </button>
      </div>

      <div className="banner warning">
        <p>Módulo en construcción. La siguiente etapa conectará esta sección con la API.</p>
      </div>

      <div className="card">
        <h3>Función prevista</h3>
        <p className="card-sub">Lo que incluirá este módulo.</p>
        <ul className="placeholder-list">
          {features.map((f) => (
            <li key={f}>
              <span className="check">&#10003;</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
