import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage   from './public/LandingPage'
import RegisterPage  from './public/RegisterPage'
import LoginPage     from './public/LoginPage'
import Home          from './public/Home'
import Profile       from './public/Profile'
import Historial     from './public/Historial'
import Sistema       from './pages/sistema/Sistema'
import LiveSession   from './pages/sistema/LiveSession'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/login"    element={<LoginPage />} />

        {/* Rutas protegidas — requieren login */}
        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/inicio"          element={<Home />} />
          <Route path="/perfil"          element={<Profile />} />
          <Route path="/sistema"         element={<Sistema />} />
          <Route path="/sistema/sesion"  element={<LiveSession />} />
          <Route path="/historial"       element={<Historial />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}