import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Ítems del OSIVQ (30 ítems: 15 Object + 15 Verbal) ────────────────────────
const ITEMS_OBJECT = [
  { id: 6,  texto: 'Mis imágenes mentales son muy coloridas y brillantes.' },
  { id: 11, texto: 'Al leer ficción, normalmente formo una imagen mental clara y detallada de una escena o habitación descrita.' },
  { id: 20, texto: 'Mis imágenes mentales son muy vívidas y fotográficas.' },
  { id: 23, texto: 'Mis imágenes mentales de diferentes objetos se parecen mucho al tamaño, forma y color de los objetos reales que he visto.' },
  { id: 26, texto: 'Cuando imagino el rostro de un amigo, tengo una imagen perfectamente clara y brillante.' },
  { id: 29, texto: 'Puedo recordar fácilmente muchos detalles visuales que otras personas quizá nunca notarían.' },
  { id: 33, texto: 'A veces mis imágenes mentales son tan vívidas y persistentes que es difícil ignorarlas.' },
  { id: 34, texto: 'Puedo cerrar los ojos e imaginar fácilmente una escena que he experimentado.' },
  { id: 40, texto: 'Recuerdo todo visualmente. Puedo relatar qué ropa llevaba la gente en una cena y cómo estaban sentados, probablemente con más detalle de lo que podría describir lo que dijeron.' },
  { id: 43, texto: 'Mis imágenes visuales están en mi mente todo el tiempo. Simplemente están ahí.' },
  { id: 45, texto: 'Cuando escucho a un locutor de radio o DJ que nunca he visto, normalmente me encuentro imaginando cómo podría verse.' },
  { id: 18, texto: 'Al entrar a una tienda familiar para buscar un artículo específico, puedo visualizar fácilmente su ubicación exacta, el estante donde está y los artículos circundantes.' },
  { id: 13, texto: 'Tengo memoria fotográfica.' },
  { id: 10, texto: 'Mis imágenes mentales son más parecidas a representaciones esquemáticas de cosas y eventos que a imágenes detalladas.', invertido: true },
  { id: 25, texto: 'Generalmente no experimento muchas imágenes mentales vívidas espontáneas; utilizo imágenes mentales principalmente para resolver problemas, como los de matemáticas.', invertido: true },
]

const ITEMS_VERBAL = [
  { id: 2,  texto: 'Tengo dificultades para expresarme por escrito.' },
  { id: 4,  texto: 'Mis habilidades verbales harían que una carrera relacionada con las artes del lenguaje fuera relativamente fácil para mí.' },
  { id: 8,  texto: 'Cuento chistes e historias mejor que la mayoría de las personas.' },
  { id: 9,  texto: 'Escribir ensayos es difícil para mí y no disfruto hacerlo en absoluto.' },
  { id: 16, texto: 'Mis habilidades verbales son excelentes.' },
  { id: 21, texto: 'Al explicar algo, prefiero dar explicaciones verbales antes que hacer dibujos o bocetos.' },
  { id: 35, texto: 'Tengo una fluidez verbal superior al promedio.' },
  { id: 36, texto: 'Preferiría tener una descripción verbal de un objeto o persona antes que una imagen.' },
  { id: 37, texto: 'Siempre soy consciente de la estructura de las oraciones.' },
  { id: 39, texto: 'Disfruto poder reformular mis pensamientos de muchas maneras, tanto al escribir como al hablar.' },
  { id: 41, texto: 'A veces tengo problemas para expresar exactamente lo que quiero decir.' },
  { id: 28, texto: 'Al recordar una escena, utilizo descripciones verbales en lugar de imágenes mentales.' },
  { id: 19, texto: 'Armar muebles es mucho más fácil para mí cuando tengo instrucciones verbales detalladas que cuando solo tengo un diagrama o imagen.' },
  { id: 24, texto: 'Normalmente no intento visualizar ni dibujar diagramas cuando leo un libro de texto.', invertido: true },
  { id: 38, texto: 'Mis imágenes mentales son más esquemáticas que coloridas y pictóricas.', invertido: true },
]

const TODOS_LOS_ITEMS = [
  ...ITEMS_OBJECT.map(i => ({ ...i, dimension: 'object' })),
  ...ITEMS_VERBAL.map(i => ({ ...i, dimension: 'verbal' })),
].sort((a, b) => a.id - b.id)

const ESCALA = [
  { valor: 1, label: 'Totalmente en desacuerdo' },
  { valor: 2, label: 'En desacuerdo' },
  { valor: 3, label: 'Neutral' },
  { valor: 4, label: 'De acuerdo' },
  { valor: 5, label: 'Totalmente de acuerdo' },
]

const COLORES = {
  Visual:     { bg: 'rgba(0,212,170,0.1)',  border: 'rgba(0,212,170,0.4)',  texto: 'var(--accent)', emoji: '👁️' },
  Verbal:     { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.4)', texto: '#818cf8',        emoji: '📝' },
  Balanceado: { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.4)', texto: '#fbbf24',        emoji: '⚖️' },
}

export default function CuestionarioOSIVQ() {
 const { enviarOSIVQ, osivqCompletado, cuestionarioCompletado } = useAuth()
  const navigate = useNavigate()

  const [respuestas,  setRespuestas]  = useState({})
  const [resultado,   setResultado]   = useState(null)
  const [enviando,    setEnviando]    = useState(false)
  const [error,       setError]       = useState(null)
  const [rehaciendo,  setRehaciendo]  = useState(false)

  const totalRespondidas = Object.keys(respuestas).length
  const progreso = Math.round((totalRespondidas / TODOS_LOS_ITEMS.length) * 100)
  const completo = totalRespondidas === TODOS_LOS_ITEMS.length

  const seleccionar = (itemId, valor) => {
    if (resultado) return
    setRespuestas(prev => ({ ...prev, [itemId]: valor }))
  }

  const enviar = async () => {
    if (!completo) return
    setEnviando(true)
    setError(null)
    try {
      const res = await enviarOSIVQ(respuestas)
      setResultado(res)
      setRehaciendo(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  const iniciarDeNuevo = () => {
    setRespuestas({})
    setResultado(null)
    setError(null)
    setRehaciendo(true)
  }

// ── Bloqueo: si no completó el F-S no puede acceder al OSIVQ ─────────────
if (!cuestionarioCompletado) {
  return (
    <div style={styles.container}>
      <div style={styles.tag}>V-COGNI · Cuestionario OSIVQ</div>
      <div style={styles.card}>
        <div style={styles.yaCompletadoIcon}>🔒</div>
        <h2 style={styles.heroTitle}>Primero completa el Cuestionario F-S</h2>
        <p style={styles.heroDesc}>
          Debes completar el Cuestionario Felder-Silverman antes de acceder al OSIVQ.
          Es el primer paso del proceso de clasificación cognitiva.
        </p>
        <button style={styles.irSistemaBtn} onClick={() => navigate('/cuestionario')}>
          Ir al Cuestionario F-S →
        </button>
      </div>
    </div>
  )
}

  // ── Pantalla: ya completó y no está rehaciendo ────────────────────────────
  if (osivqCompletado && !resultado && !rehaciendo) {
    const col = COLORES[osivqCompletado.resultado] || COLORES.Balanceado
    return (
      <div style={styles.container}>
        <div style={styles.tag}>V-COGNI · Cuestionario OSIVQ</div>
        <div style={styles.card}>
          <div style={styles.yaCompletadoIcon}>{col.emoji}</div>
          <h2 style={styles.heroTitle}>Ya completaste el cuestionario OSIVQ</h2>
          <p style={styles.heroDesc}>
            Tu resultado actual es{' '}
            <strong style={{ color: col.texto }}>{osivqCompletado.resultado}</strong>.
            Puntaje Visual Objeto: <strong>{osivqCompletado.puntaje_object}</strong> / Verbal: <strong>{osivqCompletado.puntaje_verbal}</strong>.
            Puedes volver a responderlo para actualizar tu perfil.
          </p>
          <div style={{ ...styles.resultBadge, background: col.bg, border: `1px solid ${col.border}` }}>
            <span style={{ fontSize: '32px' }}>{col.emoji}</span>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>Tu perfil cognitivo actual (OSIVQ)</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: col.texto }}>{osivqCompletado.resultado}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                Visual Objeto: {osivqCompletado.puntaje_object} · Verbal: {osivqCompletado.puntaje_verbal}
              </div>
            </div>
          </div>
          <div style={styles.botonesWrap}>
            <button style={styles.irSistemaBtn} onClick={() => navigate('/sistema')}>
              Ir a la prueba biométrica →
            </button>
            <button style={styles.rehacerBtn} onClick={iniciarDeNuevo}>
              Responder de nuevo
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Pantalla de resultado tras enviar ─────────────────────────────────────
  if (resultado) {
    const col = COLORES[resultado.resultado] || COLORES.Balanceado
    return (
      <div style={styles.container}>
        <div style={styles.tag}>V-COGNI · Cuestionario OSIVQ</div>
        <div style={styles.card}>
          <div style={styles.resultIcon}>{col.emoji}</div>
          <h2 style={styles.heroTitle}>¡Cuestionario OSIVQ completado!</h2>
          <p style={styles.heroDesc}>
            Basado en tus respuestas al cuestionario Object-Spatial Imagery and Verbal (OSIVQ), tu perfil es:
          </p>
          <div style={{ ...styles.resultBadge, background: col.bg, border: `1px solid ${col.border}` }}>
            <span style={{ fontSize: '36px' }}>{col.emoji}</span>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Perfil cognitivo detectado</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: col.texto }}>{resultado.resultado}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                Visual Objeto: {resultado.puntaje_object} / 75 · Verbal: {resultado.puntaje_verbal} / 75
              </div>
            </div>
          </div>

          <div style={styles.puntajesGrid}>
            <div style={styles.puntajeCard}>
              <div style={styles.puntajeLabel}>👁️ Visual Objeto</div>
              <div style={{ ...styles.puntajeVal, color: 'var(--accent)' }}>{resultado.puntaje_object}</div>
              <div style={styles.puntajeBar}>
                <div style={{ ...styles.puntajeBarFill, width: `${(resultado.puntaje_object / 75) * 100}%`, background: 'var(--accent)' }} />
              </div>
            </div>
            <div style={styles.puntajeCard}>
              <div style={styles.puntajeLabel}>📝 Verbal</div>
              <div style={{ ...styles.puntajeVal, color: '#818cf8' }}>{resultado.puntaje_verbal}</div>
              <div style={styles.puntajeBar}>
                <div style={{ ...styles.puntajeBarFill, width: `${(resultado.puntaje_verbal / 75) * 100}%`, background: '#818cf8' }} />
              </div>
            </div>
          </div>

          <div style={styles.resultExplica}>
            {resultado.resultado === 'Visual' && <p>Tu pensamiento es predominantemente visual-objeto: procesas y recuerdas información a través de imágenes detalladas, colores y representaciones pictóricas.</p>}
            {resultado.resultado === 'Verbal' && <p>Tu pensamiento es predominantemente verbal: procesas y recuerdas información a través de palabras, descripciones y lenguaje.</p>}
            {resultado.resultado === 'Balanceado' && <p>Tu perfil es equilibrado entre lo visual-objeto y lo verbal. La prueba biométrica ayudará a determinar con mayor precisión tu estilo dominante.</p>}
          </div>

          <div style={styles.nextStep}>
            <span style={styles.nextStepNum}>→</span>
            <span>Ahora puedes realizar la <strong>prueba biométrica</strong> de 90 segundos con la cámara.</span>
          </div>

          <div style={styles.botonesWrap}>
            <button style={styles.irSistemaBtn} onClick={() => navigate('/sistema')}>
              Ir a la prueba biométrica →
            </button>
            <button style={styles.rehacerBtn} onClick={iniciarDeNuevo}>
              Responder de nuevo
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Cuestionario activo ───────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      <div style={styles.tag}>V-COGNI · Cuestionario OSIVQ</div>

      {rehaciendo && (
        <div style={styles.rehacerBanner}>
          🔄 Estás actualizando tu cuestionario OSIVQ. Tu resultado anterior será reemplazado al enviar.
        </div>
      )}

      {/* Header card */}
      <div style={styles.card}>
        <div style={styles.quizIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <h2 style={styles.heroTitle}>Cuestionario OSIVQ</h2>
        <p style={styles.heroDesc}>
          Indica tu grado de acuerdo con cada afirmación usando la escala del 1 al 5.
          No hay respuestas correctas o incorrectas — responde según tu experiencia habitual.
          Son <strong>30 preguntas</strong> en total.
        </p>

        {/* Leyenda de escala */}
        <div style={styles.leyendaWrap}>
          {ESCALA.map(e => (
            <div key={e.valor} style={styles.leyendaItem}>
              <div style={styles.leyendaNum}>{e.valor}</div>
              <div style={styles.leyendaLabel}>{e.label}</div>
            </div>
          ))}
        </div>

        {/* Barra de progreso */}
        <div style={styles.progresoWrap}>
          <div style={styles.progresoLabel}>
            <span>{totalRespondidas} de {TODOS_LOS_ITEMS.length} respondidas</span>
            <span style={{ color: 'var(--accent)' }}>{progreso}%</span>
          </div>
          <div style={styles.progresoBar}>
            <div style={{ ...styles.progresoFill, width: `${progreso}%` }} />
          </div>
        </div>
      </div>

      {/* Preguntas */}
      {TODOS_LOS_ITEMS.map((item, idx) => {
        const resp = respuestas[item.id]
        return (
          <div key={item.id} style={{ ...styles.pregCard, ...(resp ? styles.pregCardRespondida : {}) }}>
            <div style={styles.pregHeader}>
              <div style={styles.pregNum}>{idx + 1}</div>
              <p style={styles.pregTexto}>{item.texto}</p>
              {item.invertido && (
                <div style={styles.invertidoTag}>↩ invertida</div>
              )}
            </div>
            <div style={styles.escalaWrap}>
              {ESCALA.map(e => (
                <button
                  key={e.valor}
                  style={{
                    ...styles.escalaBtn,
                    ...(resp === e.valor ? styles.escalaBtnActivo : {}),
                  }}
                  onClick={() => seleccionar(item.id, e.valor)}
                  title={e.label}
                >
                  {e.valor}
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {/* Botón enviar */}
      <div style={styles.submitWrap}>
        {error && <div style={styles.errorMsg}>{error}</div>}
        <button
          style={{ ...styles.submitBtn, ...(!completo || enviando ? styles.submitBtnDisabled : {}) }}
          onClick={enviar}
          disabled={!completo || enviando}
        >
          {enviando ? 'Enviando...' : completo ? 'Ver mi resultado →' : `Responde todas las preguntas (${totalRespondidas}/${TODOS_LOS_ITEMS.length})`}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px', margin: '0 auto', width: '100%' },
  tag: {
    display: 'inline-block', fontFamily: 'var(--mono)', fontSize: '11px',
    color: 'var(--accent)', background: 'var(--accent-dim)',
    border: '1px solid rgba(0,212,170,0.2)', borderRadius: '100px',
    padding: '4px 12px', letterSpacing: '0.08em',
  },
  rehacerBanner: {
    background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)',
    borderRadius: '8px', padding: '10px 16px', fontSize: '13px', color: '#fbbf24',
  },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '32px',
  },
  quizIcon: {
    width: '60px', height: '60px', background: 'var(--accent-dim)',
    border: '1px solid rgba(0,212,170,0.2)', borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
  },
  heroTitle: { fontSize: '20px', fontWeight: 600, marginBottom: '10px', letterSpacing: '-0.02em' },
  heroDesc:  { color: 'var(--muted2)', lineHeight: 1.75, fontSize: '14px', marginBottom: '20px' },

  leyendaWrap:  { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  leyendaItem:  { display: 'flex', alignItems: 'center', gap: '6px' },
  leyendaNum:   { width: '24px', height: '24px', borderRadius: '6px', background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)' },
  leyendaLabel: { fontSize: '11px', color: 'var(--muted)' },

  progresoWrap:  { display: 'flex', flexDirection: 'column', gap: '8px' },
  progresoLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)' },
  progresoBar:   { height: '6px', background: 'var(--border)', borderRadius: '100px', overflow: 'hidden' },
  progresoFill:  { height: '100%', background: 'var(--accent)', borderRadius: '100px', transition: 'width 0.3s ease' },

  pregCard: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '20px 24px', transition: 'border-color 0.2s',
  },
  pregCardRespondida: { borderColor: 'rgba(0,212,170,0.25)' },
  pregHeader:  { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' },
  pregNum: {
    width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
    background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)',
  },
  pregTexto:   { fontSize: '14px', fontWeight: 500, lineHeight: 1.6, margin: 0, flex: 1 },
  invertidoTag:{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--mono)', flexShrink: 0, opacity: 0.5 },

  escalaWrap: { display: 'flex', gap: '8px', alignItems: 'center' },
  escalaBtn: {
    width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
    background: 'var(--surface2)', border: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: 600, color: 'var(--muted2)',
    cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--mono)',
  },
  escalaBtnActivo: {
    background: 'var(--accent)', border: '1px solid var(--accent)',
    color: '#020c08',
  },

  submitWrap:        { padding: '8px 0 24px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' },
  submitBtn: {
    padding: '13px 32px', background: 'var(--accent)', color: '#020c08',
    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
    fontFamily: 'var(--sans)', cursor: 'pointer',
  },
  submitBtnDisabled: { background: 'var(--border)', color: 'var(--muted)', cursor: 'not-allowed' },
  errorMsg: {
    fontSize: '13px', color: '#f87171', background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '10px 14px',
  },

  resultIcon:       { fontSize: '48px', marginBottom: '16px' },
  yaCompletadoIcon: { fontSize: '40px', marginBottom: '16px' },
  resultBadge: {
    display: 'flex', alignItems: 'center', gap: '20px',
    borderRadius: '12px', padding: '20px 24px', marginBottom: '20px',
  },
  puntajesGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' },
  puntajeCard:    { background: 'var(--surface2)', borderRadius: '10px', padding: '16px' },
  puntajeLabel:   { fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' },
  puntajeVal:     { fontSize: '28px', fontWeight: 700, fontFamily: 'var(--mono)', marginBottom: '8px' },
  puntajeBar:     { height: '4px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' },
  puntajeBarFill: { height: '100%', borderRadius: '4px', transition: 'width 0.5s' },

  resultExplica: { fontSize: '13px', color: 'var(--muted2)', lineHeight: 1.75, marginBottom: '20px' },
  nextStep: {
    display: 'flex', alignItems: 'flex-start', gap: '10px',
    background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.2)',
    borderRadius: '8px', padding: '12px 14px',
    fontSize: '13px', color: 'var(--muted2)', marginBottom: '24px',
  },
  nextStepNum: { color: 'var(--accent)', fontWeight: 700, flexShrink: 0 },

  botonesWrap: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  irSistemaBtn: {
    padding: '12px 28px', background: 'var(--accent)', color: '#020c08',
    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
    fontFamily: 'var(--sans)', cursor: 'pointer',
  },
  rehacerBtn: {
    padding: '12px 20px', background: 'none', color: 'var(--muted2)',
    border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px',
    fontFamily: 'var(--sans)', cursor: 'pointer',
  },
}