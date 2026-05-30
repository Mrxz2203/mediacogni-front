import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <div style={styles.welcome}>
        <div style={styles.tag}>V-COGNI · v1.0</div>
        <h2 style={styles.title}>Bienvenido al sistema</h2>
        <p style={styles.desc}>
          V-COGNI identifica tu estilo cognitivo (visual o verbal) mediante
          seguimiento ocular en tiempo real. El proceso dura 90 segundos
          y usa tu cámara web estándar.
        </p>
        <button style={styles.btn} onClick={() => navigate('/sistema')}>
          Ir al sistema
          <ArrowIcon />
        </button>
      </div>

      <div style={styles.cards}>
        {CARDS.map(c => (
          <div key={c.label} style={styles.card}>
            <div style={styles.cardIcon}>{c.icon}</div>
            <div style={styles.cardLabel}>{c.label}</div>
            <div style={styles.cardDesc}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const CARDS = [
  { icon: '👁', label: 'Seguimiento ocular', desc: 'MediaPipe detecta landmarks faciales en tiempo real' },
  { icon: '🧠', label: 'Clasificación cognitiva', desc: 'XGBoost clasifica tu perfil: Visual o Verbal' },
  { icon: '📊', label: 'Resultados', desc: 'Revisa tu historial y evolución en el tiempo' },
]

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
    </svg>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '40px' },
  welcome: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '40px',
    maxWidth: '600px',
  },
  tag: {
    display: 'inline-block',
    fontFamily: 'var(--mono)',
    fontSize: '11px',
    color: 'var(--accent)',
    background: 'var(--accent-dim)',
    border: '1px solid rgba(0,212,170,0.2)',
    borderRadius: '100px',
    padding: '3px 12px',
    marginBottom: '16px',
    letterSpacing: '0.08em',
  },
  title: { fontSize: '26px', fontWeight: 600, marginBottom: '12px', letterSpacing: '-0.02em' },
  desc: { color: 'var(--muted2)', lineHeight: 1.7, marginBottom: '28px', fontSize: '14px' },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'var(--accent)',
    color: '#020c08',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'var(--sans)',
    transition: 'opacity 0.15s',
  },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '24px',
  },
  cardIcon: { fontSize: '24px', marginBottom: '12px' },
  cardLabel: { fontSize: '14px', fontWeight: 500, marginBottom: '6px' },
  cardDesc: { fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 },
}