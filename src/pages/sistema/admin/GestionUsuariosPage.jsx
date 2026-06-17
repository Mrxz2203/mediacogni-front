import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'http://localhost:8000'

export default function GestionUsuariosPage() {
  const [usuarios,     setUsuarios]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editForm,     setEditForm]     = useState({})
  const [expandido,    setExpandido]    = useState(null)
  const [detalle,      setDetalle]      = useState({})
  const [busqueda, setBusqueda] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('vcogni_token')

  useEffect(() => {
    fetch(`${API}/admin/usuarios?token=${token}`)
      .then(r => r.json())
      .then(data => { setUsuarios(data); setLoading(false) })
  }, [])

  const handleDelete = async () => {
    await fetch(`${API}/admin/usuarios/${deleteTarget.id}?token=${token}`, { method: 'DELETE' })
    setUsuarios(prev => prev.filter(u => u.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const handleEditSave = async () => {
    const res = await fetch(`${API}/admin/usuarios/${editTarget.id}?token=${token}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    if (res.ok) {
      const updated = await res.json()
      setUsuarios(prev => prev.map(u => u.id === updated.id ? updated : u))
      setEditTarget(null)
    }
  }

  // Cargar detalle del usuario al expandir
  const toggleExpand = async (u) => {
    if (expandido === u.id) { setExpandido(null); return }
    setExpandido(u.id)

    // Si ya cargamos, no volver a cargar
    if (detalle[u.id]) return

    setDetalle(prev => ({ ...prev, [u.id]: { loading: true } }))

    const [sesRes, qRes] = await Promise.all([
      fetch(`${API}/admin/usuarios/${u.id}/sesiones?token=${token}`),
      fetch(`${API}/admin/usuarios/${u.id}/cuestionario?token=${token}`),
    ])

    const sesiones     = sesRes.ok  ? await sesRes.json() : []
    const cuestionario = qRes.ok    ? await qRes.json()   : null

    setDetalle(prev => ({ ...prev, [u.id]: { sesiones, cuestionario, loading: false } }))
  }

  const formatFecha = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // ── Modal editar ──
  if (editTarget) return (
    <div>
      <div style={styles.formCard}>
        <p style={styles.formTitle}>Editar usuario</p>
        <div style={styles.formGrid}>
          {[
            { label: 'Nombre',  key: 'nombre' },
            { label: 'Código',  key: 'codigo' },
            { label: 'Carrera', key: 'carrera' },
          ].map(f => (
            <div key={f.key} style={styles.formField}>
              <label style={styles.label}>{f.label}</label>
              <input
                style={styles.input}
                value={editForm[f.key] ?? ''}
                onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div style={styles.formField}>
            <label style={styles.label}>Rol</label>
            <select
              style={styles.input}
              value={editForm.rol ?? ''}
              onChange={e => setEditForm({ ...editForm, rol: e.target.value })}
            >
              <option value="estudiante">estudiante</option>
              <option value="admin">admin</option>
            </select>
          </div>
        </div>
        <div style={styles.formActions}>
          <button onClick={handleEditSave} style={styles.btnGuardar}>Guardar</button>
          <button onClick={() => setEditTarget(null)} style={styles.btnCancelar}>Cancelar</button>
        </div>
      </div>
    </div>
  )

  // ── Modal eliminar ──
  if (deleteTarget) return (
    <div>
      <h2 style={styles.titleDanger}><TrashIcon />Eliminar usuario</h2>
      <div style={styles.formCard}>
        <div style={styles.deleteUser}>
          <div style={styles.avatarLg}>{deleteTarget.nombre?.charAt(0).toUpperCase()}</div>
          <div>
            <div style={styles.deleteUserName}>{deleteTarget.nombre}</div>
            <span style={styles.rolBadge}>{deleteTarget.rol}</span>
          </div>
        </div>
        <div style={styles.warningBox}>
          <strong style={{ display: 'block', marginBottom: '4px' }}>Advertencia</strong>
          Está a punto de eliminar permanentemente este usuario del sistema. Esta acción no se puede deshacer.
        </div>
        <div style={styles.dangerBox}>
          <strong style={{ display: 'block', marginBottom: '8px' }}>Consecuencias de eliminar este usuario:</strong>
          <ul style={{ paddingLeft: '18px', margin: 0, lineHeight: '1.8' }}>
            <li>Se perderán todos los datos personales</li>
            <li>Se eliminarán todas sus sesiones registradas</li>
            <li>Se perderá el historial de actividades</li>
          </ul>
        </div>
        <div style={styles.formActions}>
          <button onClick={handleDelete} style={styles.btnEliminar}>Eliminar</button>
          <button onClick={() => setDeleteTarget(null)} style={styles.btnCancelar}>Cancelar</button>
        </div>
      </div>
    </div>
  )

const usuariosFiltrados = usuarios.filter(u =>
  u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
  u.codigo.toLowerCase().includes(busqueda.toLowerCase())
)

  // ── Vista lista ──
  return (
    <div>
      <div style={styles.header}>
  <h2 style={styles.title}>Gestión de Usuarios</h2>
  <input
    style={styles.buscador}
    placeholder="Buscar por nombre o código..."
    value={busqueda}
    onChange={e => setBusqueda(e.target.value)}
  />
  <button onClick={() => navigate('/admin/usuarios')} style={styles.btnVolver}>← Volver</button>
</div>

      <div style={styles.grid}>
        {usuariosFiltrados.map(u => {
          const abierto = expandido === u.id
          const info    = detalle[u.id]

          return (
            <div key={u.id} style={{ ...styles.card, ...(abierto ? styles.cardExpanded : {}) }}>
              {/* Cabecera de la card */}
              <div style={styles.cardTop}>
                <div style={styles.avatar}>{u.nombre?.charAt(0).toUpperCase()}</div>
                <span style={{
                  ...styles.rolBadge,
                  ...(u.rol === 'admin' ? styles.rolAdmin : styles.rolEst)
                }}>{u.rol}</span>
              </div>
              <div style={styles.cardName}>{u.nombre}</div>
              <div style={styles.cardCodigo}>{u.codigo}</div>
              {u.carrera && <div style={styles.cardCarrera}>{u.carrera}</div>}

              {/* Acciones */}
              <div style={styles.cardActions}>
                <button onClick={() => { setEditTarget(u); setEditForm({ nombre: u.nombre, codigo: u.codigo, rol: u.rol, carrera: u.carrera }) }} style={styles.btnEdit}>
                  ✎ Editar
                </button>
                <button onClick={() => setDeleteTarget(u)} style={styles.btnDelete}>
                  🗑 Eliminar
                </button>
              </div>

              {/* Botón ver resultados (solo estudiantes) */}
              {u.rol === 'estudiante' && (
                <button style={styles.btnVerResultados} onClick={() => toggleExpand(u)}>
                  {abierto ? '▲ Ocultar resultados' : '▼ Ver resultados'}
                </button>
              )}

              {/* Panel expandible */}
              {abierto && (
                <div style={styles.detallePanel}>
                  {info?.loading ? (
                    <div style={styles.detalleLoading}>Cargando...</div>
                  ) : (
                    <>
                      {/* Cuestionario */}
                      <div style={styles.detalleSeccion}>
                        <div style={styles.detalleTitulo}>📝 Cuestionario F-S</div>
                        {info?.cuestionario ? (
                          <div style={styles.qResultRow}>
                            <div style={{
                              ...styles.qResultBadge,
                              color: info.cuestionario.resultado === 'Visual' ? 'var(--accent)' : info.cuestionario.resultado === 'Verbal' ? '#818cf8' : '#fbbf24',
                              background: info.cuestionario.resultado === 'Visual' ? 'rgba(0,212,170,0.1)' : info.cuestionario.resultado === 'Verbal' ? 'rgba(99,102,241,0.1)' : 'rgba(251,191,36,0.1)',
                              border: `1px solid ${info.cuestionario.resultado === 'Visual' ? 'rgba(0,212,170,0.3)' : info.cuestionario.resultado === 'Verbal' ? 'rgba(99,102,241,0.3)' : 'rgba(251,191,36,0.3)'}`,
                            }}>
                              {info.cuestionario.resultado}
                            </div>
                            <div style={styles.qPuntaje}>
                              Puntaje: {info.cuestionario.puntaje > 0 ? '+' : ''}{info.cuestionario.puntaje}
                            </div>
                            <div style={styles.qFecha}>{formatFecha(info.cuestionario.fecha)}</div>
                          </div>
                        ) : (
                          <div style={styles.sinDatos}>Sin cuestionario completado</div>
                        )}
                      </div>

                      {/* Sesiones biométricas */}
                      <div style={styles.detalleSeccion}>
                        <div style={styles.detalleTitulo}>👁️ Pruebas biométricas ({info?.sesiones?.length ?? 0})</div>
                        {info?.sesiones?.length > 0 ? (
                          <div style={styles.sesionesLista}>
                            {info.sesiones.slice(0, 5).map((ses, i) => (
                              <div key={ses.id} style={styles.sesionRow}>
                                <div style={styles.sesionNum}>#{info.sesiones.length - i}</div>
                                <div style={styles.sesionFecha}>{formatFecha(ses.fecha)}</div>
                                <div style={{
                                  ...styles.sesionBadge,
                                  color: ses.estilo_cognitivo === 'Visual' ? 'var(--accent)' : '#818cf8',
                                  background: ses.estilo_cognitivo === 'Visual' ? 'rgba(0,212,170,0.1)' : 'rgba(99,102,241,0.1)',
                                  border: `1px solid ${ses.estilo_cognitivo === 'Visual' ? 'rgba(0,212,170,0.3)' : 'rgba(99,102,241,0.3)'}`,
                                }}>
                                  {ses.estilo_cognitivo ?? '—'}
                                </div>
                                <div style={styles.sesionConf}>
                                  {ses.confianza ? `${Math.round(ses.confianza * 100)}%` : '—'}
                                </div>
                              </div>
                            ))}
                            {info.sesiones.length > 5 && (
                              <div style={styles.sinDatos}>+{info.sesiones.length - 5} sesiones más</div>
                            )}
                          </div>
                        ) : (
                          <div style={styles.sinDatos}>Sin pruebas biométricas</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TrashIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',marginRight:'8px'}}><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4h6v2"/></svg> }

const styles = {
  header:         { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  title:          { fontSize: '20px', fontWeight: 600, color: 'var(--text)', margin: 0 },
  titleDanger:    { fontSize: '20px', fontWeight: 600, color: '#ff5050', marginBottom: '24px', display: 'flex', alignItems: 'center' },
  btnVolver:      { background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 14px', color: 'var(--muted2)', fontSize: '13px', cursor: 'pointer' },
  grid:           { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' },
  card:           { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' },
  cardExpanded:   { border: '1px solid rgba(0,212,170,0.3)' },
  cardTop:        { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' },
  avatar:         { width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: 'var(--accent)' },
  avatarLg:       { width: '52px', height: '52px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 },
  rolBadge:       { padding: '2px 10px', borderRadius: '100px', fontSize: '11px', fontFamily: 'var(--mono)' },
  rolAdmin:       { background: 'rgba(0,212,170,0.1)', color: 'var(--accent)' },
  rolEst:         { background: 'var(--surface3)', color: 'var(--muted2)' },
  cardName:       { fontSize: '15px', fontWeight: 600, color: 'var(--text)' },
  cardCodigo:     { fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)' },
  cardCarrera:    { fontSize: '12px', color: 'var(--muted2)' },
  cardActions:    { display: 'flex', gap: '8px', marginTop: '12px' },
  btnEdit:        { flex: 1, padding: '6px 0', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.3)', borderRadius: '6px', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer' },
  btnDelete:      { flex: 1, padding: '6px 0', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '6px', color: '#ff5050', fontSize: '12px', cursor: 'pointer' },
  btnVerResultados: { marginTop: '8px', width: '100%', padding: '7px 0', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '6px', color: 'var(--muted2)', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--sans)' },
buscador: { background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '7px 14px', color: 'var(--text)', fontSize: '13px', fontFamily: 'var(--sans)', outline: 'none', width: '220px' },
  detallePanel:   { marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '14px' },
  detalleLoading: { fontSize: '12px', color: 'var(--muted)', textAlign: 'center', padding: '8px' },
  detalleSeccion: { display: 'flex', flexDirection: 'column', gap: '8px' },
  detalleTitulo:  { fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--muted)', letterSpacing: '0.05em' },

  qResultRow:     { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  qResultBadge:   { fontSize: '11px', fontWeight: 700, borderRadius: '100px', padding: '3px 10px' },
  qPuntaje:       { fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)' },
  qFecha:         { fontSize: '11px', color: 'var(--muted)', marginLeft: 'auto' },

  sesionesLista:  { display: 'flex', flexDirection: 'column', gap: '6px' },
  sesionRow:      { display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface2)', borderRadius: '6px', padding: '7px 10px' },
  sesionNum:      { fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--mono)', minWidth: '24px' },
  sesionFecha:    { fontSize: '11px', color: 'var(--muted2)', flex: 1 },
  sesionBadge:    { fontSize: '10px', fontWeight: 600, borderRadius: '100px', padding: '2px 8px' },
  sesionConf:     { fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)', minWidth: '32px', textAlign: 'right' },
  sinDatos:       { fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic' },

  formCard:       { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px', maxWidth: '520px' },
  formTitle:      { fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '24px', marginTop: 0 },
  formGrid:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' },
  formField:      { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:          { fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)' },
  input:          { background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text)', fontSize: '13px' },
  formActions:    { display: 'flex', gap: '12px' },
  btnGuardar:     { padding: '10px 24px', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: '#000', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  btnEliminar:    { padding: '10px 24px', background: '#ff5050', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  btnCancelar:    { padding: '10px 24px', background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: '8px', color: 'var(--muted2)', fontSize: '14px', cursor: 'pointer' },
  deleteUser:     { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' },
  deleteUserName: { fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' },
  warningBox:     { background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.25)', borderRadius: '8px', padding: '14px 16px', fontSize: '13px', color: 'var(--text)', marginBottom: '12px' },
  dangerBox:      { background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '8px', padding: '14px 16px', fontSize: '13px', color: 'var(--text)', marginBottom: '24px' },
}