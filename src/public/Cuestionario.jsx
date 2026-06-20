import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PREGUNTAS = [
  {
    id: '1',
    texto: 'Cuando aprendo algo nuevo, prefiero:',
    a: 'Ver diagramas, gráficos o imágenes',
    b: 'Leer explicaciones escritas o escuchar descripciones',
  },
  {
    id: '2',
    texto: 'Cuando recuerdo algo que aprendí, generalmente:',
    a: 'Recuerdo imágenes, figuras o lugares',
    b: 'Recuerdo palabras o frases que leí o escuché',
  },
  {
    id: '3',
    texto: 'Cuando estudio, me resulta más fácil aprender mediante:',
    a: 'Mapas conceptuales, esquemas visuales o videos',
    b: 'Resúmenes escritos, listas o grabaciones de audio',
  },
  {
    id: '4',
    texto: 'Al seguir instrucciones, prefiero:',
    a: 'Un diagrama o imagen que muestre los pasos',
    b: 'Una lista escrita paso a paso',
  },
  {
    id: '5',
    texto: 'Si tengo que explicar algo a alguien, prefiero:',
    a: 'Dibujar o mostrar con un esquema',
    b: 'Describirlo con palabras oralmente o por escrito',
  },
  {
    id: '6',
    texto: 'Cuando leo un libro de texto, me concentro más en:',
    a: 'Las figuras, tablas y gráficos',
    b: 'El texto y las explicaciones escritas',
  },
  {
    id: '7',
    texto: 'Para entender una idea compleja, me ayuda más:',
    a: 'Verla representada visualmente (gráfico, video, esquema)',
    b: 'Leer o escuchar una explicación detallada',
  },
  {
    id: '8',
    texto: 'Cuando navego por un lugar nuevo, prefiero orientarme con:',
    a: 'Un mapa visual',
    b: 'Instrucciones escritas o verbales',
  },
  {
    id: '9',
    texto: 'Al tomar apuntes en clase, suelo:',
    a: 'Hacer dibujos, flechas y esquemas visuales',
    b: 'Escribir frases y palabras clave',
  },
  {
    id: '10',
    texto: 'Cuando resuelvo un problema, prefiero:',
    a: 'Visualizarlo mentalmente o dibujarlo',
    b: 'Pensar en él verbalmente o escribirlo',
  },
  {
    id: '11',
    texto: 'Al aprender un software nuevo, prefiero:',
    a: 'Ver un video tutorial o demostración visual',
    b: 'Leer el manual o seguir instrucciones escritas',
  },
]

const COLORES = {
  Visual:     { bg: 'rgba(0,212,170,0.1)',  border: 'rgba(0,212,170,0.4)',  texto: 'var(--accent)', emoji: '👁️' },
  Verbal:     { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.4)', texto: '#818cf8',        emoji: '📝' },
  Balanceado: { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.4)', texto: '#fbbf24',        emoji: '⚖️' },
}

export default function Cuestionario() {
  const { enviarCuestionario, cuestionarioCompletado } = useAuth()
  const navigate = useNavigate()

  const [respuestas,  setRespuestas]  = useState({})
  const [resultado,   setResultado]   = useState(null)
  const [enviando,    setEnviando]    = useState(false)
  const [error,       setError]       = useState(null)
  const [rehaciendo,  setRehaciendo]  = useState(false)

  const totalRespondidas = Object.keys(respuestas).length
  const progreso = Math.round((totalRespondidas / PREGUNTAS.length) * 100)
  const completo = totalRespondidas === PREGUNTAS.length

  const seleccionar = (pregId, opcion) => {
    if (resultado) return
    setRespuestas(prev => ({ ...prev, [pregId]: opcion }))
  }

  const enviar = async () => {
    if (!completo) return
    setEnviando(true)
    setError(null)
    try {
      const res = await enviarCuestionario(respuestas)
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

  // Pantalla: ya completó y no está rehaciendo ni acaba de enviar
  if (cuestionarioCompletado && !resultado && !rehaciendo) {
    const col = COLORES[cuestionarioCompletado.resultado] || COLORES.Balanceado
    return (
      <div style={styles.container}>
        <div style={styles.tag}>V-COGNI · Cuestionario F-S</div>
        <div style={styles.card}>
          <div style={styles.yaCompletadoIcon}>{col.emoji}</div>
          <h2 style={styles.heroTitle}>Ya completaste el cuestionario</h2>
          <p style={styles.heroDesc}>
            Tu resultado actual es{' '}
            <strong style={{ color: col.texto }}>{cuestionarioCompletado.resultado}</strong>
            {' '}(puntaje: {cuestionarioCompletado.puntaje > 0 ? '+' : ''}{cuestionarioCompletado.puntaje}).
            Puedes volver a responderlo para actualizar tu perfil.
          </p>
          <div style={styles.resultBadge}>
            <span style={{ fontSize: '32px' }}>{col.emoji}</span>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>Tu perfil cognitivo actual</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: col.texto }}>{cuestionarioCompletado.resultado}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                Puntaje: {cuestionarioCompletado.puntaje > 0 ? '+' : ''}{cuestionarioCompletado.puntaje}
              </div>
            </div>
          </div>
          <div style={styles.botonesWrap}>
            <button style={styles.irSistemaBtn} onClick={() => navigate('/cuestionario-osivq')}>
              Ir al cuestionario OSIVQ →
            </button>
            <button style={styles.rehacerBtn} onClick={iniciarDeNuevo}>
              Responder de nuevo
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla de resultado tras enviar
  if (resultado) {
    const col = COLORES[resultado.resultado] || COLORES.Balanceado
    return (
      <div style={styles.container}>
        <div style={styles.tag}>V-COGNI · Cuestionario F-S</div>
        <div style={styles.card}>
          <div style={styles.resultIcon}>{col.emoji}</div>
          <h2 style={styles.heroTitle}>¡Cuestionario completado!</h2>
          <p style={styles.heroDesc}>
            Basado en tus respuestas al cuestionario Felder-Silverman, tu perfil de aprendizaje es:
          </p>
          <div style={{ ...styles.resultBadge, background: col.bg, border: `1px solid ${col.border}` }}>
            <span style={{ fontSize: '36px' }}>{col.emoji}</span>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Perfil cognitivo detectado</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: col.texto }}>{resultado.resultado}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                Puntaje: {resultado.puntaje > 0 ? '+' : ''}{resultado.puntaje} / 11
              </div>
            </div>
          </div>

          <div style={styles.resultExplica}>
            {resultado.resultado === 'Visual' && (
              <p>Prefieres procesar información a través de imágenes, gráficos y representaciones visuales. La prueba biométrica complementará este resultado con datos objetivos de movimiento ocular.</p>
            )}
            {resultado.resultado === 'Verbal' && (
              <p>Prefieres procesar información a través de palabras escritas o habladas. La prueba biométrica complementará este resultado con datos objetivos de movimiento ocular.</p>
            )}
            {resultado.resultado === 'Balanceado' && (
              <p>Tu perfil es equilibrado entre lo visual y lo verbal. La prueba biométrica ayudará a determinar con mayor precisión tu estilo dominante.</p>
            )}
          </div>

          <div style={styles.nextStep}>
            <span style={styles.nextStepNum}>→</span>
            <span>Ahora puedes realizar la <strong>prueba biométrica</strong> de 90 segundos con la cámara.</span>
          </div>

          <div style={styles.botonesWrap}>
            <button style={styles.irSistemaBtn} onClick={() => navigate('/cuestionario-osivq')}>
              Ir al cuestionario OSIVQ →
            </button>
            <button style={styles.rehacerBtn} onClick={iniciarDeNuevo}>
              Responder de nuevo
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Cuestionario activo (primera vez o rehaciendo)
  return (
    <div style={styles.container}>
      <div style={styles.tag}>V-COGNI · Cuestionario Felder-Silverman</div>

      {rehaciendo && (
        <div style={styles.rehacerBanner}>
          🔄 Estás actualizando tu cuestionario. Tu resultado anterior será reemplazado al enviar.
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
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        </div>
        <h2 style={styles.heroTitle}>Cuestionario de Estilos de Aprendizaje</h2>
        <p style={styles.heroDesc}>
          Responde las 11 preguntas eligiendo la opción que mejor describe tu forma natural de aprender.
          No hay respuestas correctas o incorrectas.
        </p>

        {/* Barra de progreso */}
        <div style={styles.progresoWrap}>
          <div style={styles.progresoLabel}>
            <span>{totalRespondidas} de {PREGUNTAS.length} respondidas</span>
            <span style={{ color: 'var(--accent)' }}>{progreso}%</span>
          </div>
          <div style={styles.progresoBar}>
            <div style={{ ...styles.progresoFill, width: `${progreso}%` }} />
          </div>
        </div>
      </div>

      {/* Preguntas */}
      {PREGUNTAS.map((p, idx) => {
        const resp = respuestas[p.id]
        return (
          <div key={p.id} style={{ ...styles.pregCard, ...(resp ? styles.pregCardRespondida : {}) }}>
            <div style={styles.pregHeader}>
              <div style={styles.pregNum}>{idx + 1}</div>
              <p style={styles.pregTexto}>{p.texto}</p>
            </div>
            <div style={styles.opciones}>
              {[{ key: 'a', texto: p.a }, { key: 'b', texto: p.b }].map(op => (
                <button
                  key={op.key}
                  style={{
                    ...styles.opcionBtn,
                    ...(resp === op.key ? styles.opcionSeleccionada : {}),
                  }}
                  onClick={() => seleccionar(p.id, op.key)}
                >
                  <div style={{
                    ...styles.opcionLetra,
                    ...(resp === op.key ? styles.opcionLetraActiva : {}),
                  }}>
                    {op.key.toUpperCase()}
                  </div>
                  <span style={styles.opcionTexto}>{op.texto}</span>
                  {resp === op.key && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  )}
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
          {enviando ? 'Enviando...' : completo ? 'Ver mi resultado →' : `Responde todas las preguntas (${totalRespondidas}/${PREGUNTAS.length})`}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '680px', margin: '0 auto', width: '100%' },
  tag: {
    display: 'inline-block', fontFamily: 'var(--mono)', fontSize: '11px',
    color: 'var(--accent)', background: 'var(--accent-dim)',
    border: '1px solid rgba(0,212,170,0.2)', borderRadius: '100px',
    padding: '4px 12px', letterSpacing: '0.08em',
  },
  rehacerBanner: {
    background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)',
    borderRadius: '8px', padding: '10px 16px',
    fontSize: '13px', color: '#fbbf24',
  },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '32px',
  },
  quizIcon: {
    width: '60px', height: '60px', background: 'var(--accent-dim)',
    border: '1px solid rgba(0,212,170,0.2)', borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '20px',
  },
  heroTitle: { fontSize: '20px', fontWeight: 600, marginBottom: '10px', letterSpacing: '-0.02em' },
  heroDesc:  { color: 'var(--muted2)', lineHeight: 1.75, fontSize: '14px', marginBottom: '24px' },

  progresoWrap:  { display: 'flex', flexDirection: 'column', gap: '8px' },
  progresoLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)' },
  progresoBar:   { height: '6px', background: 'var(--border)', borderRadius: '100px', overflow: 'hidden' },
  progresoFill:  { height: '100%', background: 'var(--accent)', borderRadius: '100px', transition: 'width 0.3s ease' },

  pregCard: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '24px', transition: 'border-color 0.2s',
  },
  pregCardRespondida: { borderColor: 'rgba(0,212,170,0.25)' },
  pregHeader: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' },
  pregNum: {
    width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
    background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)',
  },
  pregTexto: { fontSize: '14px', fontWeight: 500, lineHeight: 1.6, margin: 0 },

  opciones:          { display: 'flex', flexDirection: 'column', gap: '8px' },
  opcionBtn: {
    display: 'flex', alignItems: 'center', gap: '12px',
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: '8px', padding: '12px 14px',
    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
    fontFamily: 'var(--sans)',
  },
  opcionSeleccionada: { background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.4)' },
  opcionLetra: {
    width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
    background: 'var(--border)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '11px', fontWeight: 700,
    color: 'var(--muted)', fontFamily: 'var(--mono)',
  },
  opcionLetraActiva: { background: 'var(--accent)', color: '#020c08' },
  opcionTexto: { fontSize: '13px', color: 'var(--muted2)', lineHeight: 1.5 },

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
    background: 'var(--surface2)', border: '1px solid var(--border)',
  },
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