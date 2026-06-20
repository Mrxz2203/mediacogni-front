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

  const [osivqCompletado, setOsivqCompletado] = useState(null)

  // Bandera para mostrar aviso de "sesión expirada" tras redirigir al login
  const [sesionExpirada, setSesionExpirada] = useState(false)

  const token = localStorage.getItem('vcogni_token')

  // ── Logout interno (sin redirigir, solo limpia estado) ──
  const limpiarSesion = () => {
    localStorage.removeItem('vcogni_token')
    localStorage.removeItem('vcogni_user')
    setUser(null)
    setCuestionarioCompletado(null)
    setOsivqCompletado(null)
  }

const limpiarCuestionarioTemp = () => setCuestionarioCompletado(null)
const limpiarOsivqTemp        = () => setOsivqCompletado(null)

  // ── Helper central: hace fetch y detecta 401 en un solo lugar ──
  // Si el backend responde 401, se asume token vencido o inválido:
  // limpia la sesión, marca sesionExpirada y redirige a /login.
  const fetchAuth = async (url, options = {}) => {
    const res = await fetch(url, options)
    if (res.status === 401) {
      limpiarSesion()
      setSesionExpirada(true)
      window.location.href = '/login'
      // Lanzamos para que el caller no intente seguir usando la respuesta
      throw new Error('Sesión expirada')
    }
    return res
  }

  // Al cargar, si hay usuario logueado, consultar si ya completó el cuestionario
  useEffect(() => {
    if (user && token) {
      fetchAuth(`${API}/cuestionario/me?token=${token}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setCuestionarioCompletado(data) })
        .catch(() => {})

        fetchAuth(`${API}/cuestionario-osivq/me?token=${token}`)
        .then(r=> r.ok ? r.json() : null)
        .then(data => {if (data) setOsivqCompletado(data)})
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
    setSesionExpirada(false)

    // Cargar cuestionario al iniciar sesión
    try {
       const qRes = await fetch(`${API}/cuestionario/me?token=${data.access_token}`)
      if (qRes.ok) {
        setCuestionarioCompletado(await qRes.json())
      }
      } catch(_) {} 

      try {
        const oRes = await fetch(`${API}/cuestionario-osivq/me?token=${data.access_token}`)
        if (oRes.ok) setOsivqCompletado(await oRes.json())
      }catch(_) {}
      return data.rol
    }
    
  // Logout manual (botón "Cerrar sesión")
  const logout = () => {
    limpiarSesion()
  }

  const guardarSesion = async (sesionData) => {
    const t = localStorage.getItem('vcogni_token')
    const res = await fetchAuth(`${API}/sesiones?token=${t}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sesionData),
    })
    if (!res.ok) throw new Error('Error guardando sesión')
    return await res.json()
  }

  const getMisSesiones = async () => {
    const t = localStorage.getItem('vcogni_token')
    const res = await fetchAuth(`${API}/sesiones/me?token=${t}`)
    if (!res.ok) throw new Error('Error obteniendo historial')
    return await res.json()
  }

  // Enviar respuestas del cuestionario
  const enviarCuestionario = async (respuestas) => {
    const t = localStorage.getItem('vcogni_token')
    const res = await fetchAuth(`${API}/cuestionario?token=${t}`, {
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

  const getHistorialCuestionarios = async () => {
    const t = localStorage.getItem('vcogni_token')
    const res = await fetchAuth(`${API}/cuestionario/historial?token=${t}`)
    if (!res.ok) return []
    return await res.json()
  }

  const enviarOSIVQ = async (respuestas) => {
    const t = localStorage.getItem('vcogni_token')
    const res = await fetchAuth(`${API}/cuestionario-osivq?token=${t}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({respuestas}),
    } )
    if (!res.ok){
      const err= await res.json()
      throw new Error(err.detail || 'Error al enviar OSIVQ')
    }
    const data = await res.json()
    setOsivqCompletado(data)
    return data
  }

  const getHistorialOSIVQ = async () => {
    const t = localStorage.getItem('vcogni_token')
  const res = await fetchAuth(`${API}/cuestionario-osivq/historial?token=${t}`)
  if (!res.ok) return []
  return await res.json ()
  }


  return (
    <AuthContext.Provider value={{
      user, token,
      registro, login, logout,
      guardarSesion, getMisSesiones,
      enviarCuestionario, cuestionarioCompletado,
      getHistorialCuestionarios,
      sesionExpirada, setSesionExpirada,
      enviarOSIVQ, osivqCompletado,  
      getHistorialOSIVQ,
      limpiarCuestionarioTemp,
limpiarOsivqTemp,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}