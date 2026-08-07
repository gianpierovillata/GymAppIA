import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Clients from './pages/Clients.jsx'
import Trainers from './pages/Trainers.jsx'
import Classes from './pages/Classes.jsx'
import Schedules from './pages/Schedules.jsx'
import Plans from './pages/Plans.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<Clients />} />
        <Route path="entrenadores" element={<Trainers />} />
        <Route path="clases" element={<Classes />} />
        <Route path="horarios" element={<Schedules />} />
        <Route path="planes" element={<Plans />} />
      </Route>
    </Routes>
  )
}
