import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={s.root}>
      <div style={s.card}>
        <div style={s.code}>404</div>
        <h2 style={s.title}>Página no encontrada</h2>
        <p style={s.desc}>La ruta que intentas acceder no existe o fue movida.</p>
        <button style={s.btn} onClick={() => navigate('/inicio')}>
          Volver al inicio
        </button>
      </div>
    </div>
  )
}

const s = {
  root:  { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' },
  card:  { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px', maxWidth: '400px', width: '90%', textAlign: 'center' },
  code:  { fontFamily: 'var(--mono)', fontSize: '72px', fontWeight: 700, color: 'var(--accent)', marginBottom: '16px', letterSpacing: '-0.04em' },
  title: { fontSize: '20px', fontWeight: 600, marginBottom: '10px' },
  desc:  { fontSize: '14px', color: 'var(--muted2)', lineHeight: 1.7, marginBottom: '28px' },
  btn:   { padding: '11px 28px', background: 'var(--accent)', color: '#020c08', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--sans)', cursor: 'pointer' },
}