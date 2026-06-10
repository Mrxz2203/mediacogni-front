import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'http://localhost:8000'

export default function GestionUsuariosPage() {
  const [usuarios, setUsuarios]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editForm, setEditForm]   = useState({})
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
    const updated = await res.json()
    setUsuarios(prev => prev.map(u => u.id === editTarget.id ? updated : u))
    setEditTarget(null)
  }

  if (loading) return <p style={{ color: 'var(--muted)' }}>Cargando...</p>

  // ── Vista editar ──
  if (editTarget) return (
    <div>
      <h2 style={styles.title}>Gestión de Usuarios</h2>
      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>Editar Perfil</h3>
        <div style={styles.formGrid}>
          <div style={styles.formField}>
            <label style={styles.label}>Nombre</label>
            <input style={styles.input} value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} />
          </div>
          <div style={styles.formField}>
            <label style={styles.label}>Código</label>
            <input style={styles.input} value={editForm.codigo} onChange={e => setEditForm({...editForm, codigo: e.target.value})} />
          </div>
          <div style={styles.formField}>
            <label style={styles.label}>Rol</label>
            <select style={styles.input} value={editForm.rol} onChange={e => setEditForm({...editForm, rol: e.target.value})}>
              <option value="estudiante">Estudiante</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={styles.formField}>
            <label style={styles.label}>Carrera</label>
            <input style={styles.input} value={editForm.carrera ?? ''} onChange={e => setEditForm({...editForm, carrera: e.target.value})} />
          </div>
        </div>
        <div style={styles.formActions}>
          <button onClick={handleEditSave} style={styles.btnGuardar}>Guardar</button>
          <button onClick={() => setEditTarget(null)} style={styles.btnCancelar}>Cancelar</button>
        </div>
      </div>
    </div>
  )

  // ── Vista eliminar ──
  if (deleteTarget) return (
    <div>
      <h2 style={styles.titleDanger}>
        <TrashIcon /> Eliminar Usuario
      </h2>
      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>Eliminar Perfil</h3>
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

  // ── Vista lista ──
  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>Gestión de Usuarios</h2>
        <button onClick={() => navigate('/admin/usuarios')} style={styles.btnVolver}>← Volver</button>
      </div>
      <div style={styles.grid}>
        {usuarios.map(u => (
          <div key={u.id} style={styles.card}>
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
            <div style={styles.cardActions}>
              <button onClick={() => { setEditTarget(u); setEditForm({ nombre: u.nombre, codigo: u.codigo, rol: u.rol, carrera: u.carrera }) }} style={styles.btnEdit}>
                ✎ Editar
              </button>
              <button onClick={() => setDeleteTarget(u)} style={styles.btnDelete}>
                🗑 Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrashIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',marginRight:'8px'}}><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4h6v2"/></svg> }

const styles = {
  header:        { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  title:         { fontSize: '20px', fontWeight: 600, color: 'var(--text)', margin: 0 },
  titleDanger:   { fontSize: '20px', fontWeight: 600, color: '#ff5050', marginBottom: '24px', display: 'flex', alignItems: 'center' },
  btnVolver:     { background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 14px', color: 'var(--muted2)', fontSize: '13px', cursor: 'pointer' },
  grid:          { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' },
  card:          { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' },
  cardTop:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' },
  avatar:        { width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: 'var(--accent)' },
  avatarLg:      { width: '52px', height: '52px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 },
  rolBadge:      { padding: '2px 10px', borderRadius: '100px', fontSize: '11px', fontFamily: 'var(--mono)' },
  rolAdmin:      { background: 'rgba(0,212,170,0.1)', color: 'var(--accent)' },
  rolEst:        { background: 'var(--surface3)', color: 'var(--muted2)' },
  cardName:      { fontSize: '15px', fontWeight: 600, color: 'var(--text)' },
  cardCodigo:    { fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)' },
  cardCarrera:   { fontSize: '12px', color: 'var(--muted2)' },
  cardActions:   { display: 'flex', gap: '8px', marginTop: '12px' },
  btnEdit:       { flex: 1, padding: '6px 0', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.3)', borderRadius: '6px', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer' },
  btnDelete:     { flex: 1, padding: '6px 0', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '6px', color: '#ff5050', fontSize: '12px', cursor: 'pointer' },
  formCard:      { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px', maxWidth: '520px' },
  formTitle:     { fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '24px', marginTop: 0 },
  formGrid:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' },
  formField:     { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:         { fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)' },
  input:         { background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text)', fontSize: '13px' },
  formActions:   { display: 'flex', gap: '12px' },
  btnGuardar:    { padding: '10px 24px', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: '#000', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  btnEliminar:   { padding: '10px 24px', background: '#ff5050', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  btnCancelar:   { padding: '10px 24px', background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: '8px', color: 'var(--muted2)', fontSize: '14px', cursor: 'pointer' },
  deleteUser:    { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' },
  deleteUserName:{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' },
  warningBox:    { background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.25)', borderRadius: '8px', padding: '14px 16px', fontSize: '13px', color: 'var(--text)', marginBottom: '12px' },
  dangerBox:     { background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '8px', padding: '14px 16px', fontSize: '13px', color: 'var(--text)', marginBottom: '24px' },
}