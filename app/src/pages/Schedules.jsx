import PlaceholderPage from '../components/PlaceholderPage.jsx'

export default function Schedules() {
  return (
    <PlaceholderPage
      title="Horarios / Turnos"
      subtitle="Programación semanal de clases y turnos del personal."
      features={[
        'Vista semanal de horarios por día de la semana.',
        'Franjas horarias para cada clase y su salón.',
        'Turnos de trabajo de cada entrenador.',
        'Detección de choques de horario.',
      ]}
    />
  )
}
