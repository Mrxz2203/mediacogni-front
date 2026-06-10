import { createContext, useContext, useState } from 'react'

const API = 'http://localhost:8000'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vcogni_user')
    return saved ? JSON.parse(saved) : null
  })

  const token = localStorage.getItem('vcogni_token')

  const registro = async (data) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Error en registro')
    return await res.json()
  }

  const login = async (codigo, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo, password }),
    })
    if (!res.ok) throw new Error('Credenciales incorrectas')
    const data = await res.json()
    localStorage.setItem('vcogni_token', data.access_token)
    const userData = { nombre: data.nombre, rol: data.rol, codigo, id: data.id }
    localStorage.setItem('vcogni_user', JSON.stringify(userData))
    setUser(userData)
    return data.rol
  }

  const logout = () => {
    localStorage.removeItem('vcogni_token')
    localStorage.removeItem('vcogni_user')
    setUser(null)
  }

  const guardarSesion = async (sesionData) => {
    const t = localStorage.getItem('vcogni_token')
    const res = await fetch(`${API}/sesiones?token=${t}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sesionData),
    })
    if (!res.ok) throw new Error('Error guardando sesión')
    return await res.json()
  }

  const getMisSesiones = async () => {
    const t = localStorage.getItem('vcogni_token')
    const res = await fetch(`${API}/sesiones/me?token=${t}`)
    if (!res.ok) throw new Error('Error obteniendo historial')
    return await res.json()
  }

  return (
    <AuthContext.Provider value={{ user, token, registro, login, logout, guardarSesion, getMisSesiones }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}