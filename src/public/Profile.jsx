import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:8000'

const CARRERAS = [
  'Ingeniería de Sistemas',
  'Ingeniería de Sistemas de Información',
  'Ingeniería Industrial',
  'Administración',
  'Contabilidad',
  'Derecho',
  'Medicina',
  'Otra',
]

export default function Profile() {
  const { user } = useAuth()
  const token = localStorage.getItem('vcogni_token')

  const [editing, setEditing]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [success, setSuccess]   = useState(false)
  const [errors,  setErrors]    = useState({})
  const [apiError, setApiError] = useState('')

  const [form, setForm] = useState({
    nombre:    user?.nombre   ?? '',
    codigo:    user?.codigo   ?? '',
    password:  '',
    carrera:   user?.carrera  ?? '',
  })

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
    setSuccess(false)
    setApiError('')
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim())
      e.nombre = 'El nombre completo es obligatorio.'
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/.test(form.nombre.trim()))
      e.nombre = 'Formato de Nombre completo no válido.'
    if (!form.codigo.trim())
      e.codigo = 'El código institucional es obligatorio.'
    if (form.password && form.password.length < 6)
      e.password = 'La contraseña debe tener al menos 6 caracteres.'
    return e
  }

  const handleSave = async () => {
    setSubmitted(true)
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    try {
      const body = {
        nombre:  form.nombre,
        codigo:  form.codigo,
        carrera: form.carrera,
      }
      if (form.password) body.password = form.password

      const res = await fetch(`${API}/usuarios/me/update?token=${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Error al actualizar')

      // Actualizar localStorage
      const updated = { ...user, nombre: form.nombre, carrera: form.carrera }
      localStorage.setItem('vcogni_user', JSON.stringify(updated))

      setSuccess(true)
      setEditing(false)
      setForm({ ...form, password: '' })
    } catch {
      setApiError('No se pudo actualizar el perfil. Intenta de nuevo.')
    }
  }

  const inicial = user?.nombre?.charAt(0).toUpperCase() ?? '?'

  return (
    <div style={s.container}>

      {/* Alertas */}
      {success && (
        <div style={s.alertSuccess}>
          <span style={s.alertIcon}>✓</span>
          <div>
            <div style={s.alertTitle}>Perfil actualizado correctamente</div>
            <div style={s.alertDesc}>Tus datos personales han sido actualizados exitosamente.</div>
          </div>
        </div>
      )}

      {apiError && (
        <div style={s.alertError}>
          <span style={s.alertIcon}>⚠</span>
          <div>
            <div style={s.alertTitle}>{apiError}</div>
          </div>
        </div>
      )}

      {submitted && Object.keys(errors).length > 0 && (
  <div style={s.alertError}>
          <span style={s.alertIcon}>⚠</span>
          <div>
            <div style={s.alertTitle}>Debe completar los campos obligatorios.</div>
            <div style={s.alertDesc}>Por favor, revisa los campos marcados en rojo.</div>
          </div>
        </div>
      )}

      {/* Card principal */}
      <div style={s.card}>

        {/* Avatar + info */}
        <div style={s.avatarSection}>
          <div style={s.avatar}>{inicial}</div>
          <div>
            <div style={s.userName}>{user?.nombre}</div>
            <div style={s.userRol}>{user?.rol === 'estudiante' ? '🎓 Estudiante' : '📋 Docente'}</div>
            {user?.carrera && <div style={s.userCarrera}>{user.carrera}</div>}
          </div>
          {!editing && (
            <button style={s.editBtn} onClick={() => { setEditing(true); setSuccess(false) }}>
              <EditIcon /> Editar perfil
            </button>
          )}
        </div>

        <div style={s.divider} />

        {/* Campos */}
        {!editing ? (
          /* Vista */
          <div style={s.fields}>
            <Field label="Nombre completo" value={user?.nombre} />
            <Field label="Código institucional" value={user?.codigo} />
            <Field label="Rol" value={user?.rol === 'estudiante' ? 'Estudiante' : 'Docente'} />
            {user?.carrera && <Field label="Carrera" value={user.carrera} />}
            <Field label="Contraseña" value="••••••••••••" />
          </div>
        ) : (
          /* Edición */
          <div style={s.fields}>
            <div style={s.field}>
              <label style={s.label}>Nombre completo <span style={s.req}>*</span></label>
              <input
                name="nombre" value={form.nombre} onChange={handleChange}
                style={{ ...s.input, ...(errors.nombre ? s.inputError : {}) }}
                placeholder="Tu nombre completo"
              />
              {errors.nombre && <div style={s.errorMsg}>{errors.nombre}</div>}
            </div>

            <div style={s.field}>
              <label style={s.label}>Código institucional <span style={s.req}>*</span></label>
              <input
                name="codigo" value={form.codigo} onChange={handleChange}
                style={{ ...s.input, ...(errors.codigo ? s.inputError : {}) }}
                placeholder="U20XXXXXXX"
              />
              {errors.codigo && <div style={s.errorMsg}>{errors.codigo}</div>}
            </div>

            <div style={s.field}>
              <label style={s.label}>Nueva contraseña <span style={s.optional}>(opcional)</span></label>
              <input
                name="password" type="password" value={form.password} onChange={handleChange}
                style={{ ...s.input, ...(errors.password ? s.inputError : {}) }}
                placeholder="Dejar en blanco para no cambiar"
              />
              {errors.password && <div style={s.errorMsg}>{errors.password}</div>}
            </div>

            {user?.rol === 'estudiante' && (
              <div style={s.field}>
                <label style={s.label}>Carrera <span style={s.req}>*</span></label>
                <select name="carrera" value={form.carrera} onChange={handleChange} style={s.input}>
                  <option value="">Selecciona tu carrera</option>
                  {CARRERAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            <div style={s.btnRow}>
              <button style={s.saveBtn} onClick={handleSave}>Guardar</button>
              <button style={s.cancelBtn} onClick={() => {
                setEditing(false)
                setErrors({})
                 setSubmitted(false) 
                setApiError('')
                setForm({ nombre: user?.nombre ?? '', codigo: user?.codigo ?? '', password: '', carrera: user?.carrera ?? '' })
              }}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <div style={s.fieldValue}>{value}</div>
    </div>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

const s = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' },
  alertSuccess: { display: 'flex', alignItems: 'flex-start', gap: '14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '16px 20px' },
  alertError: { display: 'flex', alignItems: 'flex-start', gap: '14px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '10px', padding: '16px 20px' },
  alertIcon: { fontSize: '18px', marginTop: '1px' },
  alertTitle: { fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' },
  alertDesc: { fontSize: '12px', color: 'var(--muted2)' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px' },
  avatarSection: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' },
  avatar: { width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)', flexShrink: 0 },
  userName: { fontSize: '18px', fontWeight: 600, marginBottom: '4px' },
  userRol: { fontSize: '13px', color: 'var(--muted2)', marginBottom: '2px' },
  userCarrera: { fontSize: '12px', color: 'var(--muted)' },
  editBtn: { marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', color: 'var(--text)', cursor: 'pointer', fontFamily: 'var(--sans)' },
  divider: { height: '1px', background: 'var(--border)', marginBottom: '24px' },
  fields: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--muted)', letterSpacing: '0.05em' },
  req: { color: 'var(--danger)' },
  optional: { color: 'var(--muted)', fontWeight: 400 },
  fieldValue: { fontSize: '14px', color: 'var(--text)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px' },
  input: { background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: 'var(--text)', fontFamily: 'var(--sans)', outline: 'none', width: '100%' },
  inputError: { border: '1px solid var(--danger)', background: 'rgba(244,63,94,0.05)' },
  errorMsg: { fontSize: '11px', color: 'var(--danger)', marginTop: '2px' },
  btnRow: { display: 'flex', gap: '12px', marginTop: '8px' },
  saveBtn: { flex: 1, padding: '10px', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: '#020c08', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--sans)', cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '10px', background: 'none', border: '1px solid var(--border2)', borderRadius: '8px', color: 'var(--muted2)', fontSize: '14px', fontFamily: 'var(--sans)', cursor: 'pointer' },
}