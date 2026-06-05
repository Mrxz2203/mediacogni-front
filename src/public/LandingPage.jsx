import { useNavigate } from 'react-router-dom'
import analisis from '../assets/analisis.png'
import cogni from '../assets/cogni.png'
import ocularImg from '../assets/ocular.png'
import clasiImg from '../assets/clasi.png'
import historialImg from '../assets/historial.png'
import protegerImg from '../assets/proteger.png'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={s.root}>
      <nav style={s.nav}>
        <div style={s.logo}>
          <img src={cogni} alt="V-COGNI" style={s.logoImg} />
          <div>
            <div style={s.logoName}>V-COGNI</div>
            <div style={s.logoSub}>Eye Tracking System</div>
          </div>
        </div>
        <div style={s.navBtns}>
          <button style={s.btnSecondary} onClick={() => navigate('/registro')}>Registrarse</button>
          <button style={s.btnPrimary} onClick={() => navigate('/login')}>Iniciar Sesión</button>
        </div>
      </nav>

      <main style={s.hero}>
        <div style={s.heroText}>
          <div style={s.heroBadge}>
            <span style={s.heroBadgeDot} />
            Clasificación cognitiva en tiempo real
          </div>
          <h1 style={s.heroTitle}>
            Identifica el <span style={s.heroAccent}>estilo cognitivo</span> de tus estudiantes
          </h1>
          <p style={s.heroDesc}>
            V-COGNI analiza el comportamiento visual mediante webcam estándar para clasificar
            perfiles cognitivos de forma objetiva, no invasiva y con más del{' '}
            <strong style={{ color: 'var(--accent)' }}>82% de exactitud</strong>.
          </p>
          <div style={s.heroBtns}>
            <button style={s.btnPrimary} onClick={() => navigate('/registro')}>
              Comenzar gratis
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
              </svg>
            </button>
            <button style={s.btnGhost} onClick={() => navigate('/login')}>Ya tengo cuenta</button>
          </div>
          <div style={s.stats}>
            {STATS.map(st => (
              <div key={st.label} style={s.stat}>
                <div style={s.statVal}>{st.val}</div>
                <div style={s.statLabel}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.heroVisual}>
          <img src={analisis} alt="Análisis cognitivo" style={s.heroImg} />
        </div>
      </main>

      <section style={s.features}>
        {FEATURES.map(f => (
          <div key={f.title} style={s.featureCard}>
            <div style={s.featureIcon}>
              <img src={f.img} alt={f.title} style={s.featureImg} />
            </div>
            <div style={s.featureTitle}>{f.title}</div>
            <div style={s.featureDesc}>{f.desc}</div>
          </div>
        ))}
      </section>

      <footer style={s.footer}>
        <div style={s.footerLogo}>V-COGNI</div>
        <div style={s.footerText}>Copyright © 2026 · Todos los derechos reservados a V-COGNI</div>
      </footer>
    </div>
  )
}

const STATS = [
  { val: '82%', label: 'Exactitud' },
  { val: '90s', label: 'Por sesión' },
  { val: '2',   label: 'Perfiles cognitivos' },
]

// Las imágenes se importan arriba y se referencian aquí
const FEATURES = [
  { img: ocularImg,   title: 'Seguimiento ocular',    desc: 'MediaPipe detecta landmarks faciales con precisión milimétrica en tiempo real usando tu webcam estándar.' },
  { img: clasiImg,    title: 'Clasificación XGBoost', desc: 'Modelo entrenado que clasifica automáticamente el perfil cognitivo: Visual o Verbal con alta confianza.' },
  { img: historialImg,title: 'Historial y evolución', desc: 'Revisa los resultados de cada sesión y compara la evolución del perfil cognitivo a lo largo del tiempo.' },
  { img: protegerImg, title: 'No invasivo',           desc: 'Sin hardware especial, sin almacenamiento de video. Solo se procesan datos biométricos en tiempo real.' },
]

const s = {
  root: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)' },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: '68px', background: 'rgba(8,11,16,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', zIndex: 100 },
  logo: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoImg: { width: '48px', height: '48px', objectFit: 'contain' },
  logoName: { fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' },
  logoSub: { fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.03em' },
  navBtns: { display: 'flex', gap: '12px' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', background: 'var(--accent)', color: '#020c08', border: 'none', borderRadius: '100px', padding: '10px 22px', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--sans)', cursor: 'pointer' },
  btnSecondary: { background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border2)', borderRadius: '100px', padding: '10px 22px', fontSize: '14px', fontFamily: 'var(--sans)', cursor: 'pointer' },
  btnGhost: { background: 'none', color: 'var(--muted2)', border: '1px solid var(--border)', borderRadius: '100px', padding: '10px 22px', fontSize: '14px', fontFamily: 'var(--sans)', cursor: 'pointer' },
  hero: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '48px', padding: '120px 48px 80px', flex: 1 },
  heroText: { flex: 1, maxWidth: '520px' },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '100px', padding: '5px 14px', marginBottom: '24px', letterSpacing: '0.06em' },
  heroBadgeDot: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' },
  heroTitle: { fontSize: '46px', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '20px' },
  heroAccent: { color: 'var(--accent)' },
  heroDesc: { fontSize: '16px', color: 'var(--muted2)', lineHeight: 1.75, marginBottom: '36px' },
  heroBtns: { display: 'flex', gap: '12px', marginBottom: '48px' },
  stats: { display: 'flex', gap: '36px' },
  stat: {},
  statVal: { fontFamily: 'var(--mono)', fontSize: '26px', fontWeight: 700, color: 'var(--accent)' },
  statLabel: { fontSize: '12px', color: 'var(--muted)', marginTop: '2px' },
  heroVisual: { flex: 1, display: 'flex', justifyContent: 'center' },
  heroImg: { maxWidth: '480px', width: '100%', objectFit: 'contain' },
  features: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '0 48px 80px' },
  featureCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' },
  featureIcon: { marginBottom: '14px' },
  featureImg: { width: '48px', height: '48px', objectFit: 'contain' },  // ajusta el tamaño a tu gusto
  featureTitle: { fontSize: '14px', fontWeight: 600, marginBottom: '8px' },
  featureDesc: { fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65 },
  footer: { background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  footerLogo: { fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' },
  footerText: { fontSize: '12px', color: 'var(--muted)' },
}