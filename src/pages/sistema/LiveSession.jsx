import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const TOTAL = 90
const API   = 'http://localhost:8000'

const TEXTO_ACADEMICO = {
  titulo: "Estructuras de datos: Grafos y árboles",
  parrafos: [
    "Un grafo es una estructura matemática compuesta por vértices y aristas que los conectan. Los grafos se utilizan para modelar relaciones entre objetos en diversas áreas como redes de computadoras, mapas de ciudades y redes sociales.",
    "Los árboles de expansión mínima son subgrafos que conectan todos los vértices con el menor costo posible. El algoritmo de Kruskal ordena las aristas por peso y las agrega siempre que no formen un ciclo entre los nodos existentes.",
    "El algoritmo de Dijkstra encuentra el camino más corto entre dos nodos de un grafo ponderado. Utiliza una cola de prioridad para explorar siempre el nodo con menor distancia acumulada desde el origen.",
    "Las estructuras de datos jerárquicas como los árboles binarios permiten búsquedas eficientes en tiempo O(log n). Cada nodo tiene como máximo dos hijos: izquierdo y derecho, organizados según un criterio de orden.",
  ]
}

export default function LiveSession() {
  const [timeLeft,   setTimeLeft]   = useState(TOTAL)
  const [gazeData,   setGazeData]   = useState(null)
  const [showCancel, setShowCancel] = useState(false)
  const [phase,      setPhase]      = useState('running') // running | classifying | done | error
  const [resultado,  setResultado]  = useState(null)
  const [activePara, setActivePara] = useState(0)
  const metricsRef = useRef([])
  const navigate   = useNavigate()
  const { user }   = useAuth()
  const token      = localStorage.getItem('vcogni_token')

  /* ── Timer ── */
  useEffect(() => {
    if (phase !== 'running') return
    if (timeLeft <= 0) { handleSessionEnd(); return }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, phase])

  /* ── Párrafo activo cada 22s ── */
  useEffect(() => {
    if (phase !== 'running') return
    const elapsed = TOTAL - timeLeft
    const idx = Math.min(Math.floor(elapsed / 22), TEXTO_ACADEMICO.parrafos.length - 1)
    setActivePara(idx)
  }, [timeLeft, phase])

  /* ── SSE — recibir y acumular métricas ── */
  useEffect(() => {
    const es = new EventSource('http://localhost:5002/stream')
    es.onmessage = e => {
      try {
        const d = JSON.parse(e.data)
        setGazeData(d)
        // Acumular solo si la sesión está corriendo
        if (phase === 'running' && d.headPose) {
          metricsRef.current.push({
            yaw:         d.headPose.yaw,
            pitch:       d.headPose.pitch,
            roll:        d.headPose.roll,
            gaze_x:      d.gazeXNorm,
            gaze_y:      d.gazeYNorm,
            blink_ratio: d.blinkRatio,
            pupil_px:    d.pupilDiameterPx,
          })
        }
      } catch {}
    }
    return () => es.close()
  }, [phase])

  /* ── Enviar métricas al terminar ── */
  const handleSessionEnd = async () => {
    setPhase('classifying')
    try {
      const res = await fetch(`${API}/clasificar?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metricas: metricsRef.current,
          duracion: TOTAL,
        }),
      })
      if (!res.ok) throw new Error('Error al clasificar')
      const data = await res.json()
      setResultado(data)
      setPhase('done')
    } catch (err) {
      console.error(err)
      setPhase('error')
    }
  }

  const progress = ((TOTAL - timeLeft) / TOTAL) * 100
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')

  /* ── Pantalla clasificando ── */
  if (phase === 'classifying') {
    return (
      <div style={s.doneWrap}>
        <div style={s.doneCard}>
          <div style={{ ...s.doneIcon, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: 'var(--accent2)', fontSize: 32 }}>⚙</div>
          <h2 style={s.doneTitle}>Clasificando tu perfil...</h2>
          <p style={s.doneDesc}>XGBoost está analizando {metricsRef.current.length} métricas capturadas durante la sesión.</p>
          <div style={s.loadingBar}><div style={s.loadingFill} /></div>
        </div>
      </div>
    )
  }

  /* ── Pantalla error ── */
  if (phase === 'error') {
    return (
      <div style={s.doneWrap}>
        <div style={s.doneCard}>
          <div style={{ ...s.doneIcon, background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', color: 'var(--danger)' }}>✕</div>
          <h2 style={s.doneTitle}>Error al clasificar</h2>
          <p style={s.doneDesc}>No se pudo conectar con la API. Verifica que el servidor FastAPI esté corriendo en el puerto 8000.</p>
          <button style={s.histBtn} onClick={() => navigate('/sistema')}>Volver al sistema</button>
        </div>
      </div>
    )
  }

  /* ── Pantalla resultado ── */
  if (phase === 'done' && resultado) {
    const esVisual = resultado.estilo_cognitivo === 'Visual'
    return (
      <div style={s.doneWrap}>
        <div style={s.doneCard}>
          <div style={s.doneIcon}>✓</div>
          <div style={s.doneTag}>Sesión completada</div>
          <h2 style={s.doneTitle}>Tu estilo cognitivo ha sido clasificado</h2>
          <p style={s.doneDesc}>{resultado.mensaje}</p>

          <div style={s.doneResult}>
            <div style={s.resultLabel}>Perfil detectado</div>
            <div style={{
              ...s.resultValue,
              color: esVisual ? 'var(--accent)' : 'var(--accent2)'
            }}>
              {resultado.estilo_cognitivo}
            </div>
            {/* Barra de confianza */}
            <div style={s.confRow}>
              <span style={s.confLabel}>Confianza</span>
              <div style={s.confBarWrap}>
                <div style={{
                  ...s.confBarFill,
                  width: `${Math.round(resultado.confianza * 100)}%`,
                  background: esVisual ? 'var(--accent)' : 'var(--accent2)',
                }} />
              </div>
              <span style={s.confPct}>{Math.round(resultado.confianza * 100)}%</span>
            </div>
            <div style={s.metricasCount}>
              {metricsRef.current.length} métricas analizadas · {TOTAL}s de sesión
            </div>
          </div>

          <button style={{
            ...s.histBtn,
            background: esVisual ? 'var(--accent)' : 'var(--accent2)',
          }} onClick={() => navigate('/historial')}>
            Ver en Historial →
          </button>
        </div>
      </div>
    )
  }

  /* ── Sesión en vivo ── */
  return (
    <>
      <div style={s.root}>

        {/* Columna izquierda: cámara + timer */}
        <div style={s.leftCol}>
          <div style={s.panelLabel}>
            <span style={s.liveTag}>● EN VIVO</span>
            <span style={s.camLabel}>Cámara · {metricsRef.current.length} métricas</span>
          </div>

          <div style={s.cameraWrap}>
            <img src="http://localhost:5002/video_feed" alt="feed" style={s.camImg}
              onError={e => { e.target.style.display = 'none' }} />
            {['tl','tr','bl','br'].map(c => <div key={c} style={{...s.corner, ...s[c]}} />)}
          </div>

          <div style={s.timerCard}>
            <div style={s.timerLabel}>tiempo restante</div>
            <div style={{
              ...s.timerValue,
              color: timeLeft <= 10 ? 'var(--danger)' : 'var(--text)'
            }}>{mins}:{secs}</div>
            <div style={s.progressBg}>
              <div style={{ ...s.progressBar, width: `${progress}%`,
                background: timeLeft <= 10 ? 'var(--danger)' : 'var(--accent)'
              }} />
            </div>
          </div>

          <button style={s.cancelBtn} onClick={() => setShowCancel(true)}>
            Cancelar sesión
          </button>
        </div>

        {/* Columna central: texto académico */}
        <div style={s.textCol}>
          <div style={s.textHeader}>
            <div style={s.textTag}>Material de lectura</div>
            <div style={s.textInstr}>Lee el texto con atención durante la sesión</div>
          </div>
          <div style={s.textCard}>
            <h3 style={s.textTitulo}>{TEXTO_ACADEMICO.titulo}</h3>
            <div style={s.parasWrap}>
              {TEXTO_ACADEMICO.parrafos.map((p, i) => (
                <p key={i} style={{
                  ...s.para,
                  ...(i === activePara ? s.paraActive : s.paraDim),
                }}>{p}</p>
              ))}
            </div>
          </div>
          <div style={s.paraIndicator}>
            {TEXTO_ACADEMICO.parrafos.map((_, i) => (
              <div key={i} style={{
                ...s.paraDot,
                background: i === activePara ? 'var(--accent)' : 'var(--surface3)',
                border: i === activePara ? '1px solid var(--accent)' : '1px solid var(--border2)',
              }} />
            ))}
          </div>
        </div>

        {/* Columna derecha: métricas */}
        <div style={s.metricsCol}>
          <div style={s.panelLabel}>
            <span style={s.camLabel}>Métricas en vivo</span>
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>Orientación de cabeza</div>
            <div style={s.poseGrid}>
              {['yaw','pitch','roll'].map(k => (
                <div key={k} style={s.poseCard}>
                  <div style={s.poseAxis}>{k}</div>
                  <div style={s.poseVal}>
                    {gazeData?.headPose ? `${gazeData.headPose[k].toFixed(1)}°` : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>Posición de mirada</div>
            <div style={s.gazeRow}>
              <div style={s.gazeItem}>
                <div style={s.gazeLabel}>Eje X</div>
                <div style={s.gazeVal}>{gazeData ? gazeData.gazeXNorm.toFixed(3) : '—'}</div>
              </div>
              <div style={s.gazeItem}>
                <div style={s.gazeLabel}>Eje Y</div>
                <div style={s.gazeVal}>{gazeData ? gazeData.gazeYNorm.toFixed(3) : '—'}</div>
              </div>
            </div>
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>Estado ocular</div>
            <div style={s.blinkRow}>
              <div style={s.gazeItem}>
                <div style={s.gazeLabel}>Blink ratio</div>
                <div style={s.gazeVal}>{gazeData ? gazeData.blinkRatio.toFixed(3) : '—'}</div>
              </div>
              <div style={{
                ...s.blinkBadge,
                background: gazeData?.blinkRatio < 0.22 ? 'rgba(244,63,94,0.1)' : 'var(--accent-dim)',
                color: gazeData?.blinkRatio < 0.22 ? 'var(--danger)' : 'var(--accent)',
              }}>
                {gazeData?.blinkRatio < 0.22 ? 'PARPADEANDO' : 'ABIERTO'}
              </div>
            </div>
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>Diámetro pupilar</div>
            <div style={s.gazeVal}>
              {gazeData ? `${Math.round(gazeData.pupilDiameterPx)} px` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Modal cancelar */}
      {showCancel && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>¿Cancelar sesión?</h3>
            <p style={s.modalDesc}>Se perderán los {metricsRef.current.length} datos capturados hasta ahora.</p>
            <div style={s.modalBtns}>
              <button style={s.keepBtn} onClick={() => setShowCancel(false)}>Continuar sesión</button>
              <button style={s.confirmCancel} onClick={() => navigate('/sistema')}>Sí, cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const s = {
  root: { display: 'grid', gridTemplateColumns: '300px 1fr 260px', gap: '16px', height: 'calc(100vh - var(--header-h) - 64px)' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '12px' },
  panelLabel: { display: 'flex', alignItems: 'center', gap: '10px' },
  liveTag: { fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--danger)', letterSpacing: '0.1em' },
  camLabel: { fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' },
  cameraWrap: { position: 'relative', background: '#000', borderRadius: 'var(--radius)', overflow: 'hidden', aspectRatio: '4/3' },
  camImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  corner: { position: 'absolute', width: '14px', height: '14px', borderColor: 'var(--accent)', borderStyle: 'solid', opacity: 0.7 },
  tl: { top: 8, left: 8, borderWidth: '2px 0 0 2px' },
  tr: { top: 8, right: 8, borderWidth: '2px 2px 0 0' },
  bl: { bottom: 8, left: 8, borderWidth: '0 0 2px 2px' },
  br: { bottom: 8, right: 8, borderWidth: '0 2px 2px 0' },
  timerCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px' },
  timerLabel: { fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' },
  timerValue: { fontFamily: 'var(--mono)', fontSize: '32px', fontWeight: 700, marginBottom: '10px', transition: 'color 0.3s' },
  progressBg: { height: '4px', background: 'var(--surface3)', borderRadius: '4px', overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: '4px', transition: 'width 1s linear, background 0.3s' },
  cancelBtn: { padding: '10px', background: 'none', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', color: 'var(--danger)', fontSize: '13px', fontFamily: 'var(--sans)', cursor: 'pointer' },
  textCol: { display: 'flex', flexDirection: 'column', gap: '12px' },
  textHeader: { display: 'flex', alignItems: 'baseline', gap: '12px' },
  textTag: { fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '100px', padding: '3px 10px', letterSpacing: '0.08em' },
  textInstr: { fontSize: '12px', color: 'var(--muted)' },
  textCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px', flex: 1, overflowY: 'auto' },
  textTitulo: { fontSize: '16px', fontWeight: 600, marginBottom: '20px', letterSpacing: '-0.01em' },
  parasWrap: { display: 'flex', flexDirection: 'column', gap: '16px' },
  para: { fontSize: '14px', lineHeight: 1.8, borderRadius: '8px', padding: '12px 14px', transition: 'all 0.5s' },
  paraActive: { color: 'var(--text)', background: 'var(--accent-dim)', borderLeft: '3px solid var(--accent)' },
  paraDim: { color: 'var(--muted)', background: 'transparent', borderLeft: '3px solid transparent' },
  paraIndicator: { display: 'flex', gap: '8px', justifyContent: 'center' },
  paraDot: { width: '8px', height: '8px', borderRadius: '50%', transition: 'all 0.4s' },
  metricsCol: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' },
  section: {},
  sectionTitle: { fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' },
  poseGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' },
  poseCard: { background: 'var(--surface2)', borderRadius: '8px', padding: '10px 8px' },
  poseAxis: { fontSize: '9px', fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: '4px' },
  poseVal: { fontSize: '16px', fontFamily: 'var(--mono)', fontWeight: 700 },
  gazeRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' },
  gazeItem: { background: 'var(--surface2)', borderRadius: '8px', padding: '10px' },
  gazeLabel: { fontSize: '9px', fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: '4px' },
  gazeVal: { fontSize: '16px', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--text)' },
  blinkRow: { display: 'flex', flexDirection: 'column', gap: '8px' },
  blinkBadge: { borderRadius: '100px', padding: '5px 12px', fontSize: '11px', fontFamily: 'var(--mono)', fontWeight: 700, letterSpacing: '0.05em', textAlign: 'center' },
  /* Done */
  doneWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  doneCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px', maxWidth: '440px', width: '100%', textAlign: 'center' },
  doneIcon: { width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: 'var(--success)', margin: '0 auto 20px' },
  doneTag: { fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '100px', padding: '3px 12px', display: 'inline-block', marginBottom: '12px', letterSpacing: '0.08em' },
  doneTitle: { fontSize: '20px', fontWeight: 600, marginBottom: '10px' },
  doneDesc: { fontSize: '13px', color: 'var(--muted2)', lineHeight: 1.7, marginBottom: '24px' },
  doneResult: { background: 'var(--surface2)', borderRadius: '12px', padding: '20px', marginBottom: '24px' },
  resultLabel: { fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' },
  resultValue: { fontSize: '36px', fontWeight: 700, fontFamily: 'var(--mono)', marginBottom: '16px' },
  confRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  confLabel: { fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' },
  confBarWrap: { flex: 1, height: '6px', background: 'var(--surface3)', borderRadius: '4px', overflow: 'hidden' },
  confBarFill: { height: '100%', borderRadius: '4px', transition: 'width 0.5s' },
  confPct: { fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 700, color: 'var(--text)', minWidth: '40px' },
  metricasCount: { fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)' },
  histBtn: { width: '100%', padding: '12px', border: 'none', borderRadius: '8px', color: '#020c08', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--sans)', cursor: 'pointer' },
  loadingBar: { height: '4px', background: 'var(--surface2)', borderRadius: '4px', overflow: 'hidden', marginTop: '20px' },
  loadingFill: { height: '100%', width: '60%', background: 'var(--accent2)', borderRadius: '4px', animation: 'pulse 1.5s infinite' },
  /* Modal */
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  modal: { background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-lg)', padding: '32px', maxWidth: '380px', width: '90%' },
  modalTitle: { fontSize: '18px', fontWeight: 600, marginBottom: '10px' },
  modalDesc: { fontSize: '13px', color: 'var(--muted2)', marginBottom: '24px' },
  modalBtns: { display: 'flex', gap: '12px' },
  keepBtn: { flex: 1, padding: '10px', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: '#020c08', fontWeight: 600, fontFamily: 'var(--sans)', fontSize: '13px', cursor: 'pointer' },
  confirmCancel: { flex: 1, padding: '10px', background: 'none', border: '1px solid rgba(244,63,94,0.4)', borderRadius: '8px', color: 'var(--danger)', fontFamily: 'var(--sans)', fontSize: '13px', cursor: 'pointer' },
}