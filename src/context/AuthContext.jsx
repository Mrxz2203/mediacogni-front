import { createContext, useContext, useState, useEffect } from 'react'

const API = 'http://localhost:8000'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vcogni_user')
    return saved ? JSON.parse(saved) : null
  })

  // Estado del cuestionario: null = no completado, objeto = resultado
  const [cuestionarioCompletado, setCuestionarioCompletado] = useState(null)

  const token = localStorage.getItem('vcogni_token')

  // Al cargar, si hay usuario logueado, consultar si ya completó el cuestionario
  useEffect(() => {
    if (user && token) {
      fetch(`${API}/cuestionario/me?token=${token}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setCuestionarioCompletado(data) })
        .catch(() => {})
    }
  }, [user])

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

    // Cargar cuestionario al iniciar sesión
    try {
      const qRes = await fetch(`${API}/cuestionario/me?token=${data.access_token}`)
      if (qRes.ok) {
        const qData = await qRes.json()
        setCuestionarioCompletado(qData)
      }
    } catch (_) {}

    return data.rol
  }

  const logout = () => {
    localStorage.removeItem('vcogni_token')
    localStorage.removeItem('vcogni_user')
    setUser(null)
    setCuestionarioCompletado(null)
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

  // Enviar respuestas del cuestionario
  const enviarCuestionario = async (respuestas) => {
    const t = localStorage.getItem('vcogni_token')
    const res = await fetch(`${API}/cuestionario?token=${t}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respuestas }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Error al enviar cuestionario')
    }
    const data = await res.json()
    setCuestionarioCompletado(data)
    return data
  }

  return (
    <AuthContext.Provider value={{
      user, token,
      registro, login, logout,
      guardarSesion, getMisSesiones,
      enviarCuestionario, cuestionarioCompletado,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}