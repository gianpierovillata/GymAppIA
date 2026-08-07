import PlaceholderPage from '../components/PlaceholderPage.jsx'

export default function Plans() {
  return (
    <PlaceholderPage
      title="Planes"
      subtitle="Membresías ofrecidas y asignación a clientes."
      features={[
        'Catálogo de planes con duración y precio de referencia.',
        'Asignación de un plan a cada cliente.',
        'Vigencia de la membresía (fecha de inicio y fin).',
        'Estado activo, expirado o cancelado.',
      ]}
    />
  )
}
