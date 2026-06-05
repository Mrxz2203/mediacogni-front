import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import iluminarImg from '../../assets/iluminar.png'
import camaraImg   from '../../assets/camara.png'
import pythonImg   from '../../assets/python.png'

export default function Sistema() {
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <div style={styles.container}>
        {/* Header badge */}
        <div style={styles.tag}>V-COGNI · Clasificador cognitivo</div>

        {/* Main intro card */}
        <div style={styles.heroCard}>
          <div style={styles.eyeGlyph}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <h2 style={styles.heroTitle}>¿Qué es V-COGNI?</h2>
          <p style={styles.heroDesc}>
            V-Cogni analiza tu comportamiento ocular durante 90 segundos para identificar
            tu estilo cognitivo. El sistema utiliza <strong style={{ color: 'var(--accent)' }}>MediaPipe</strong> para
            detectar los movimientos de tus ojos en tiempo real y <strong style={{ color: 'var(--accent)' }}>XGBoost</strong> para
            clasificarte como estudiante <em>Visual</em> o <em>Verbal</em>.
          </p>

          <div style={styles.steps}>
            {STEPS.map((s, i) => (
              <div key={i} style={styles.step}>
                <div style={styles.stepNum}>{i + 1}</div>
                <div>
                  <div style={styles.stepTitle}>{s.title}</div>
                  <div style={styles.stepDesc}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button style={styles.startBtn} onClick={() => setShowModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
              <polygon points="5,3 19,12 5,21"/>
            </svg>
            Iniciar proceso
          </button>
        </div>

        {/* Requirements */}
        <div style={styles.reqRow}>
          {REQS.map(r => (
            <div key={r.label} style={styles.reqCard}>
              <img src={r.img} alt={r.label} style={styles.reqImg} />
              <div>
                <div style={styles.reqLabel}>{r.label}</div>
                <div style={styles.reqDesc}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <h3 style={styles.modalTitle}>Permiso de cámara requerido</h3>
            <p style={styles.modalDesc}>
              V-COGNI necesita acceso a tu cámara web para analizar tus movimientos oculares.
              El video <strong>no se almacena</strong> — solo se procesan los datos biométricos en tiempo real.
            </p>
            <div style={styles.modalNote}>
              <span>⏱</span>
              <span>La sesión dura exactamente <strong>90 segundos</strong>. Asegúrate de estar en un lugar bien iluminado.</span>
            </div>
            <div style={styles.modalBtns}>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button style={styles.confirmBtn} onClick={() => navigate('/sistema/sesion')}>
                Sí, continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const STEPS = [
  { title: 'Permiso de cámara', desc: 'Aceptas el acceso a tu webcam estándar.' },
  { title: 'Sesión de 90 segundos', desc: 'El sistema captura tus métricas oculares en vivo.' },
  { title: 'Clasificación automática', desc: 'XGBoost determina tu perfil: Visual o Verbal.' },
  { title: 'Resultados en Historial', desc: 'Tu estilo cognitivo queda guardado para revisión.' },
]

const REQS = [
  { img: camaraImg,   label: 'Cámara web',        desc: 'Cualquier webcam estándar' },
  { img: iluminarImg, label: 'Buena iluminación',  desc: 'Evita contraluz directa' },
  { img: pythonImg,   label: 'Python corriendo',   desc: 'eye_coordinates_cam.py activo' },
]

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '720px', margin: '0 auto', width: '100%' },
  tag: {
    display: 'inline-block', fontFamily: 'var(--mono)', fontSize: '11px',
    color: 'var(--accent)', background: 'var(--accent-dim)',
    border: '1px solid rgba(0,212,170,0.2)', borderRadius: '100px',
    padding: '4px 12px', letterSpacing: '0.08em',
  },
  heroCard: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '40px',
  },
  eyeGlyph: {
    width: '72px', height: '72px', background: 'var(--accent-dim)',
    border: '1px solid rgba(0,212,170,0.2)', borderRadius: '20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '24px',
  },
  heroTitle: { fontSize: '22px', fontWeight: 600, marginBottom: '12px', letterSpacing: '-0.02em' },
  heroDesc: { color: 'var(--muted2)', lineHeight: 1.75, fontSize: '14px', marginBottom: '32px' },
  steps: { display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' },
  step: { display: 'flex', alignItems: 'flex-start', gap: '14px' },
  stepNum: {
    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
    background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)',
  },
  stepTitle: { fontSize: '14px', fontWeight: 500, marginBottom: '2px' },
  stepDesc: { fontSize: '12px', color: 'var(--muted)' },
  startBtn: {
    display: 'inline-flex', alignItems: 'center',
    background: 'var(--accent)', color: '#020c08',
    border: 'none', borderRadius: '8px', padding: '12px 24px',
    fontSize: '14px', fontWeight: 600, fontFamily: 'var(--sans)', cursor: 'pointer',
  },
  reqRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  reqCard: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '16px 18px',
    display: 'flex', alignItems: 'flex-start', gap: '12px',
  },
  reqImg: { width: '40px', height: '40px', objectFit: 'contain', flexShrink: 0 },
  reqLabel: { fontSize: '13px', fontWeight: 500, marginBottom: '2px' },
  reqDesc: { fontSize: '11px', color: 'var(--muted)' },
  /* Modal */
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 999,
  },
  modal: {
    background: 'var(--surface)', border: '1px solid var(--border2)',
    borderRadius: 'var(--radius-lg)', padding: '36px',
    maxWidth: '440px', width: '90%',
  },
  modalIcon: {
    width: '56px', height: '56px', background: 'var(--accent-dim)',
    border: '1px solid rgba(0,212,170,0.2)', borderRadius: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '20px',
  },
  modalTitle: { fontSize: '18px', fontWeight: 600, marginBottom: '12px' },
  modalDesc: { fontSize: '13px', color: 'var(--muted2)', lineHeight: 1.7, marginBottom: '16px' },
  modalNote: {
    display: 'flex', alignItems: 'flex-start', gap: '10px',
    background: 'var(--surface2)', borderRadius: '8px', padding: '12px 14px',
    fontSize: '12px', color: 'var(--muted2)', marginBottom: '28px',
  },
  modalBtns: { display: 'flex', gap: '12px' },
  cancelBtn: {
    flex: 1, padding: '10px', background: 'none',
    border: '1px solid var(--border2)', borderRadius: '8px',
    color: 'var(--muted2)', fontSize: '14px', fontFamily: 'var(--sans)', cursor: 'pointer',
  },
  confirmBtn: {
    flex: 1, padding: '10px', background: 'var(--accent)',
    border: 'none', borderRadius: '8px', color: '#020c08',
    fontSize: '14px', fontWeight: 600, fontFamily: 'var(--sans)', cursor: 'pointer',
  },
}