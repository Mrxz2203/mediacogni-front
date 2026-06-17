import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import cogni from '../assets/cogni.png'
import loginImg from '../assets/login.png'
import { useAuth } from '../context/AuthContext'


export default function LoginPage() {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const [form, setForm] = useState({ codigo: '', contrasena: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  
 if (user) return <Navigate to="/inicio" replace />

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '', general: '' })
  }

  const validate = () => {
    const e = {}
    if (!form.codigo.trim())     e.codigo    = 'El código institucional es obligatorio.'
    if (!form.contrasena.trim()) e.contrasena = 'La contraseña es obligatoria.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    try {
      await login(form.codigo, form.contrasena)
      navigate('/inicio')
    } catch {
      setErrors({ general: 'Código o contraseña incorrectos.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.root}>
      <nav style={s.nav}>
        <img src={cogni} alt="V-COGNI" style={s.logoImg} onClick={() => navigate('/')} />
        <div style={s.navBtns}>
          <button style={s.btnSecondary} onClick={() => navigate('/registro')}>Registrarse</button>
          <button style={s.btnPrimary}   onClick={() => navigate('/login')}>Iniciar Sesión</button>
        </div>
      </nav>

      <div style={s.body}>
        <div style={s.left}>
          <h2 style={s.leftTitle}>¡Inicia sesión para</h2>
          <h2 style={{ ...s.leftTitle, color: 'var(--accent)', marginBottom: 40 }}>empezar a explorar!</h2>
          <img src={loginImg} alt="Login" style={s.illustration} />
        </div>

        <div style={s.right}>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div>
                <div style={s.cardTitle}>Bienvenido de vuelta</div>
                <div style={s.cardSub}>Ingresa tus credenciales institucionales</div>
              </div>
            </div>

            {errors.general && (
              <div style={s.alertError}>
                <span>⚠</span>
                <span>{errors.general}</span>
              </div>
            )}

            <div style={s.formWrap}>
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

              <div style={s.btnRow}>
                <button
                  onClick={handleSubmit}
                  style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}
                  disabled={loading}
                >
                  {loading ? 'Ingresando...' : 'Iniciar sesión'}
                </button>
                <button onClick={() => navigate('/')} style={s.btnCancel}>Cancelar</button>
              </div>

              <p style={s.hint}>
                ¿No tienes cuenta?{' '}
                <span style={s.hintLink} onClick={() => navigate('/registro')}>Regístrate aquí</span>
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
  illustration: { width: '300px', objectFit: 'contain', marginTop: '32px' },
  right: { flex: 1, display: 'flex', justifyContent: 'center' },
  card: { width: '100%', maxWidth: '400px', background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: '20px', padding: '32px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' },
  cardIcon: { width: '44px', height: '44px', background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitle: { fontSize: '16px', fontWeight: 600, marginBottom: '2px' },
  cardSub: { fontSize: '12px', color: 'var(--muted)' },
  alertError: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--danger)', marginBottom: '16px' },
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