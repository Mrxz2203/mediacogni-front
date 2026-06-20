import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ocularImg from '../assets/ocular.png'
import clasiImg from '../assets/clasi.png'
import resultadosImg from '../assets/resultados.png'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const isAdmin = user?.rol === 'admin'

  return (
    <div style={styles.container}>

      {/* Card de bienvenida centrada */}
      <div style={styles.centered}>
        <div style={styles.welcome}>
          <div style={styles.tag}>V-COGNI</div>
          <h2 style={styles.title}>
            Bienvenido, {user?.nombre?.split(' ')[0] ?? 'usuario'} 👋
          </h2>
          <p style={styles.desc}>
            V-COGNI identifica tu estilo cognitivo (visual o verbal) combinando tres métodos: 
el Cuestionario Felder-Silverman, el Cuestionario OSIVQ y seguimiento ocular en 
tiempo real de 90 segundos con tu cámara web estándar.
          </p>

          {/* Botón solo para estudiantes */}
          {!isAdmin && (
            <button style={styles.btn} onClick={() => navigate('/cuestionario')}>
              Ir al Cuestionario F-S
              <ArrowIcon />
            </button>
          )}
        </div>
      </div>

      {/* Cards informativas solo para estudiantes */}
      {!isAdmin && (
        <div style={styles.cardsWrap}>
          <div style={styles.cards}>
            {CARDS.map(c => (
              <div key={c.label} style={styles.card}>
                <div style={styles.cardIcon}>
                  <img src={c.img} alt={c.label} style={styles.cardImg} />
                </div>
                <div style={styles.cardLabel}>{c.label}</div>
                <div style={styles.cardDesc}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

const CARDS = [
  { img: ocularImg,     label: 'Cuestionarios',     desc: 'Felder-Silverman (11 preguntas) + OSIVQ (30 preguntas) para evaluar tu perfil cognitivo' },
  { img: clasiImg,      label: 'Prueba biométrica', desc: 'MediaPipe detecta tus movimientos oculares y XGBoost clasifica tu perfil: Visual o Verbal' },
  { img: resultadosImg, label: 'Resultados',        desc: 'Validación cruzada de los 3 métodos y evolución de tu perfil en el tiempo' },
]

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
    </svg>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    alignItems: 'center',
    width: '100%',
  },
  centered: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  welcome: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '40px',
    width: '100%',
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
  title: {
    fontSize: '26px',
    fontWeight: 600,
    marginBottom: '12px',
    letterSpacing: '-0.02em',
  },
  desc: {
    color: 'var(--muted2)',
    lineHeight: 1.7,
    marginBottom: '28px',
    fontSize: '14px',
  },
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
    cursor: 'pointer',
  },
  cardsWrap: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    width: '100%',
    maxWidth: '600px',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '24px',
  },
  cardIcon:  { marginBottom: '12px' },
  cardImg:   { width: '48px', height: '48px', objectFit: 'contain' },
  cardLabel: { fontSize: '14px', fontWeight: 500, marginBottom: '6px' },
  cardDesc:  { fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 },
}