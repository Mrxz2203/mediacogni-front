import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage         from './public/LandingPage'
import RegisterPage        from './public/RegisterPage'
import LoginPage           from './public/LoginPage'
import Home                from './public/Home'
import Profile             from './public/Profile'
import Historial           from './public/Historial'
import Cuestionario        from './public/Cuestionario'
import Sistema             from './pages/sistema/Sistema'
import LiveSession         from './pages/sistema/LiveSession'
import AdminDashboardPage  from './pages/sistema/admin/AdminDashboardPage'
import GestionUsuariosPage from './pages/sistema/admin/GestionUsuariosPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<LandingPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/login"    element={<LoginPage />} />

        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* Rutas estudiante */}
          <Route path="/inicio"         element={<Home />} />
          <Route path="/perfil"         element={<Profile />} />
          <Route path="/cuestionario"   element={<Cuestionario />} />
          <Route path="/sistema"        element={<Sistema />} />
          <Route path="/sistema/sesion" element={<LiveSession />} />
          <Route path="/historial"      element={<Historial />} />

          {/* Rutas admin */}
          <Route path="/admin/usuarios"       element={<AdminDashboardPage />} />
          <Route path="/admin/usuarios/lista" element={<GestionUsuariosPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}