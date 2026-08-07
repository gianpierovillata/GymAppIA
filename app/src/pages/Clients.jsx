import PlaceholderPage from '../components/PlaceholderPage.jsx'

export default function Clients() {
  return (
    <PlaceholderPage
      title="Clientes"
      subtitle="Datos de contacto, membresías y planes asignados."
      features={[
        'Registro de nuevos clientes con datos personales y contacto.',
        'Búsqueda y edición de la información de cada cliente.',
        'Historial de planes asignados y su vigencia.',
        'Estado activo / inactivo de cada cuenta.',
      ]}
    />
  )
}
