import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'http://localhost:8000'

export default function AdminDashboardPage() {
  const [stats,   setStats]   = useState({ usuarios: 0, sesiones: 0 })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const token = localStorage.getItem('vcogni_token')

  useEffect(() => {
    Promise.all([
      fetch(`${API}/admin/usuarios?token=${token}`).then(r => r.json()),
      fetch(`${API}/admin/sesiones/total?token=${token}`).then(r => r.json()),
    ]).then(([usuarios, sesiones]) => {
      setStats({ usuarios: usuarios.length, sesiones: sesiones.total })
      setLoading(false)
    })
  }, [])

  if (loading) return <p style={{ color: 'var(--muted)' }}>Cargando...</p>

  return (
    <div>
      <h2 style={styles.title}>Panel de Administración</h2>

      <div style={styles.cardsRow}>
        <div style={styles.card}>
          <div style={styles.cardIcon}><UsersIcon /></div>
          <div style={styles.cardNum}>{stats.usuarios}</div>
          <div style={styles.cardLabel}>Usuarios registrados</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardIcon}><SessionIcon /></div>
          <div style={styles.cardNum}>{stats.sesiones}</div>
          <div style={styles.cardLabel}>Sesiones totales</div>
        </div>
      </div>

      <button style={styles.btn} onClick={() => navigate('/admin/usuarios/lista')}>
        <UsersIcon />
        Ver usuarios
      </button>
    </div>
  )
}

function UsersIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
function SessionIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg> }

const styles = {
  title:     { fontSize: '20px', fontWeight: 600, color: 'var(--text)', marginBottom: '28px' },
  cardsRow:  { display: 'flex', gap: '16px', marginBottom: '32px' },
  card:      { flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' },
  cardIcon:  { color: 'var(--accent)', marginBottom: '4px' },
  cardNum:   { fontSize: '36px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)' },
  cardLabel: { fontSize: '13px', color: 'var(--muted)' },
  btn:       { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: '#000', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
}