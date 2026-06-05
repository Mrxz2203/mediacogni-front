import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import cogni from '../assets/cogni.png'
import registerImg from '../assets/Register.png'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [rol, setRol] = useState('estudiante')
  const [form, setForm] = useState({ nombre: '', codigo: '', contrasena: '', carrera: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { registro } = useAuth()

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '', general: '' })
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim())
      e.nombre = 'El nombre es obligatorio.'
    if (!form.codigo.trim())
      e.codigo = 'El código institucional es obligatorio.'
    if (!form.contrasena.trim())
      e.contrasena = 'La contraseña es obligatoria.'
    else if (form.contrasena.length < 6)
      e.contrasena = 'Mínimo 6 caracteres.'
    if (rol === 'estudiante' && !form.carrera)
      e.carrera = 'Selecciona una carrera.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    try {
      await registro({ nombre: form.nombre, codigo: form.codigo, password: form.contrasena, rol, carrera: form.carrera })
      navigate('/login')
    } catch {
      setErrors({ general: 'Error al registrar. El código ya puede estar en uso.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.root}>

      {/* Navbar */}
      <nav style={s.nav}>
        <img src={cogni} alt="V-COGNI" style={s.logoImg} onClick={() => navigate('/')} />
        <div style={s.navBtns}>
          <button style={s.btnSecondary} onClick={() => navigate('/registro')}>Registrarse</button>
          <button style={s.btnPrimary}   onClick={() => navigate('/login')}>Iniciar Sesión</button>
        </div>
      </nav>

      {/* Contenido */}
      <div style={s.body}>

        {/* Izquierda */}
        <div style={s.left}>
          <h2 style={s.leftTitle}>Conoce cómo aprendes,</h2>
          <h2 style={{ ...s.leftTitle, color: 'var(--accent)', marginBottom: 32 }}>no solo qué aprendes.</h2>
          <img src={registerImg} alt="Registro" style={s.illustration} />
        </div>

        {/* Derecha — formulario */}
        <div style={s.right}>
          <div style={s.card}>

            {/* Error general */}
            {errors.general && (
              <div style={s.alertError}>
                <span>⚠</span>
                <span>{errors.general}</span>
              </div>
            )}

            {/* Selector de rol */}
            <div style={s.rolRow}>
              {['estudiante', 'docente'].map(r => (
                <button key={r} onClick={() => setRol(r)} style={{
                  ...s.rolBtn,
                  border: rol === r ? '2px solid var(--accent)' : '2px solid var(--border2)',
                  background: rol === r ? 'var(--accent-dim)' : 'var(--surface2)',
                }}>
                  <span style={{ fontSize: 22 }}>{r === 'estudiante' ? '🎓' : '📋'}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: rol === r ? 'var(--accent)' : 'var(--muted2)', textTransform: 'capitalize' }}>{r}</span>
                </button>
              ))}
            </div>

            {/* Form */}
            <div style={s.formWrap}>

              <div style={s.field}>
                <label style={s.label}>Nombre completo</label>
                <input
                  name="nombre" value={form.nombre} onChange={handleChange}
                  placeholder="Tu nombre"
                  style={{ ...s.input, ...(errors.nombre ? s.inputError : {}) }}
                />
                {errors.nombre && <div style={s.errorMsg}>{errors.nombre}</div>}
              </div>

              <div style={s.field}>
                <label style={s.label}>Código institucional</label>
                <input
                  name="codigo" value={form.codigo} onChange={handleChange}
                  placeholder="U20XXXXXXX"
                  style={{ ...s.input, ...(errors.codigo ? s.inputError : {}) }}
                />
                {errors.codigo && <div style={s.errorMsg}>{errors.codigo}</div>}
              </div>

              <div style={s.field}>
                <label style={s.label}>Contraseña</label>
                <input
                  name="contrasena" type="password" value={form.contrasena} onChange={handleChange}
                  placeholder="••••••••"
                  style={{ ...s.input, ...(errors.contrasena ? s.inputError : {}) }}
                />
                {errors.contrasena && <div style={s.errorMsg}>{errors.contrasena}</div>}
              </div>

              {rol === 'estudiante' && (
                <div style={s.field}>
                  <label style={s.label}>Carrera</label>
                  <select
                    name="carrera" value={form.carrera} onChange={handleChange}
                    style={{ ...s.input, ...(errors.carrera ? s.inputError : {}) }}
                  >
                    <option value="">Selecciona tu carrera</option>
                    <option value="ingenieria_sistemas">Ingeniería de Sistemas</option>
                    <option value="ingenieria_industrial">Ingeniería Industrial</option>
                    <option value="administracion">Administración</option>
                    <option value="contabilidad">Contabilidad</option>
                    <option value="derecho">Derecho</option>
                    <option value="medicina">Medicina</option>
                    <option value="otra">Otra</option>
                  </select>
                  {errors.carrera && <div style={s.errorMsg}>{errors.carrera}</div>}
                </div>
              )}

              <div style={s.btnRow}>
                <button
                  onClick={handleSubmit}
                  style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}
                  disabled={loading}
                >
                  {loading ? 'Registrando...' : 'Registrar'}
                </button>
                <button onClick={() => navigate('/')} style={s.btnCancel}>Cancelar</button>
              </div>

              <p style={s.hint}>
                ¿Ya tienes cuenta?{' '}
                <span style={s.hintLink} onClick={() => navigate('/login')}>Inicia sesión</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer style={s.footer}>
        Copyright © 2026 · Todos los derechos reservados a V-COGNI
      </footer>
    </div>
  )
}

const s = {
  root: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)' },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: '68px', background: 'rgba(8,11,16,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', zIndex: 100 },
  logoImg: { width: '48px', height: '48px', objectFit: 'contain', cursor: 'pointer' },
  navBtns: { display: 'flex', gap: '12px' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent)', color: '#020c08', border: 'none', borderRadius: '100px', padding: '10px 22px', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--sans)', cursor: 'pointer' },
  btnSecondary: { background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border2)', borderRadius: '100px', padding: '10px 22px', fontSize: '14px', fontFamily: 'var(--sans)', cursor: 'pointer' },
  body: { display: 'flex', flex: 1, alignItems: 'center', gap: '48px', padding: '100px 48px 80px' },
  left: { flex: 1, maxWidth: '440px', display: 'flex', flexDirection: 'column' },
  leftTitle: { fontSize: '32px', fontWeight: 700, lineHeight: 1.2, color: 'var(--text)', margin: 0 },
  illustration: { width: '280px', objectFit: 'contain', marginTop: '32px' },
  right: { flex: 1, display: 'flex', justifyContent: 'center' },
  card: { width: '100%', maxWidth: '420px', background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: '20px', padding: '32px' },
  alertError: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--danger)', marginBottom: '16px' },
  rolRow: { display: 'flex', gap: '12px', marginBottom: '24px' },
  rolBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '14px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' },
  formWrap: { display: 'flex', flexDirection: 'column', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--muted)', letterSpacing: '0.05em' },
  input: { background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: 'var(--text)', fontFamily: 'var(--sans)', outline: 'none', width: '100%' },
  inputError: { border: '1px solid var(--danger)', background: 'rgba(244,63,94,0.05)' },
  errorMsg: { fontSize: '11px', color: 'var(--danger)' },
  btnRow: { display: 'flex', gap: '12px', marginTop: '4px' },
  btnCancel: { flex: 1, padding: '10px', background: 'none', border: '1px solid var(--border2)', borderRadius: '8px', color: 'var(--muted2)', fontSize: '14px', fontFamily: 'var(--sans)', cursor: 'pointer' },
  hint: { textAlign: 'center', fontSize: '12px', color: 'var(--muted)' },
  hintLink: { color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 },
  footer: { background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '16px 48px', textAlign: 'center', fontSize: '12px', color: 'var(--muted)' },
}