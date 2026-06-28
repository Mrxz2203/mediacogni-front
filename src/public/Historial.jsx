import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const SESIONES_POR_PAGINA = 5

// ── Buscar cuestionario vigente para una sesión (por fecha) ───────────────────
function getVigente(lista, fechaSesion) {
  const fecha = new Date(fechaSesion)
  const anteriores = lista.filter(q => new Date(q.fecha) <= fecha)
  if (anteriores.length === 0) return null
  return anteriores.reduce((a, b) => new Date(a.fecha) > new Date(b.fecha) ? a : b)
}

// ── Validación cruzada de 3 métodos ──────────────────────────────────────────
function validarTresMedodos(resultadoFS, resultadoOSIVQ, estiloBiometrico, confianza) {
  if (!estiloBiometrico) return null
  const confianzaPct       = Math.round((confianza ?? 0) * 100)
  const biometricoIncierto = confianzaPct < 60
  if (!resultadoFS && !resultadoOSIVQ) return null
  const resultados = [resultadoFS, resultadoOSIVQ].filter(Boolean)
  const coinciden  = resultados.filter(r => r === estiloBiometrico || r === 'Balanceado').length
  const total      = resultados.length
  if (biometricoIncierto) {
    return { icono: '❌', label: 'Resultado descartado', desc: 'La prueba biométrica no fue concluyente (confianza < 60%). Se recomienda repetir la prueba.', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)' }
  }
  if (coinciden === total) {
    return { icono: '✅', label: 'Confirmado con alta confianza', desc: `Los ${total > 1 ? 'cuestionarios coinciden' : 'cuestionario coincide'} con la prueba biométrica: perfil ${estiloBiometrico}.`, color: 'var(--accent)', bg: 'rgba(0,212,170,0.08)', border: 'rgba(0,212,170,0.25)' }
  }
  if (coinciden > 0) {
    return { icono: '📊', label: 'Coincidencia parcial', desc: `${coinciden} de ${total} cuestionarios coinciden con el resultado biométrico (${estiloBiometrico}).`, color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)' }
  }
  return { icono: '⚠️', label: 'Discrepancia', desc: `Los cuestionarios y la prueba biométrica (${estiloBiometrico}) no coinciden. Se recomienda repetir el proceso.`, color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)' }
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Historial() {
  const { getMisSesiones, getHistorialCuestionarios, getHistorialOSIVQ, cuestionarioCompletado, osivqCompletado, user } = useAuth()

  const [sesiones,      setSesiones]      = useState([])
  const [cuestionarios, setCuestionarios] = useState([])
  const [osivqs,        setOsivqs]        = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [expandido,     setExpandido]     = useState(null)
  const [pagina,        setPagina]        = useState(1)

  useEffect(() => {
    const cargar = async () => {
      try {
        const [ses, qs, os] = await Promise.all([
          getMisSesiones(),
          getHistorialCuestionarios(),
          getHistorialOSIVQ(),
        ])
        setSesiones(ses)
        setCuestionarios(qs)
        setOsivqs(os)
      } catch {
        setError('No se pudo cargar el historial.')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const formatFecha = (iso) => new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
  const formatHora  = (iso) => new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

  // ── Paginación ──────────────────────────────────────────────────────────────
  const totalPaginas    = Math.ceil(sesiones.length / SESIONES_POR_PAGINA)
  const sesionesEnPagina = sesiones.slice((pagina - 1) * SESIONES_POR_PAGINA, pagina * SESIONES_POR_PAGINA)

  const irPagina = (n) => {
    setPagina(n)
    setExpandido(null) // cerrar panel expandido al cambiar página
  }

  return (
    <div style={s.container}>

      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.tag}>Resultados guardados</div>
          <p style={s.subtitle}>Historial de sesiones de {user?.nombre}</p>
        </div>
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={s.statVal}>{sesiones.length}</div>
            <div style={s.statLabel}>Sesiones</div>
          </div>
          <div style={s.statCard}>
            <div style={{ ...s.statVal, color: 'var(--accent)' }}>
              {sesiones.filter(x => x.estilo_cognitivo === 'Visual').length}
            </div>
            <div style={s.statLabel}>Visual</div>
          </div>
          <div style={s.statCard}>
            <div style={{ ...s.statVal, color: 'var(--accent2)' }}>
              {sesiones.filter(x => x.estilo_cognitivo === 'Verbal').length}
            </div>
            <div style={s.statLabel}>Verbal</div>
          </div>
        </div>
      </div>

      {/* Banners cuestionarios actuales */}
      <div style={s.bannersWrap}>
        {cuestionarioCompletado && (
          <div style={s.qBanner}>
            <span>📝</span>
            <div>
              <span style={s.qBannerLabel}>F-S actual — </span>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{cuestionarioCompletado.resultado}</span>
              <span style={s.qBannerSub}> (puntaje: {cuestionarioCompletado.puntaje > 0 ? '+' : ''}{cuestionarioCompletado.puntaje})</span>
              {cuestionarios.length > 1 && <span style={s.qBannerSub}> · {cuestionarios.length} registros</span>}
            </div>
          </div>
        )}
        {osivqCompletado && (
          <div style={s.qBanner}>
            <span>📋</span>
            <div>
              <span style={s.qBannerLabel}>OSIVQ actual — </span>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{osivqCompletado.resultado}</span>
              <span style={s.qBannerSub}> (V.Obj: {osivqCompletado.puntaje_object} · Verb: {osivqCompletado.puntaje_verbal})</span>
              {osivqs.length > 1 && <span style={s.qBannerSub}> · {osivqs.length} registros</span>}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={s.empty}>Cargando historial...</div>
      ) : error ? (
        <div style={s.errorBox}>{error}</div>
      ) : sesiones.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>📊</div>
          <div style={s.emptyTitle}>Sin sesiones aún</div>
          <div style={s.emptyDesc}>Completa una sesión en el Sistema para ver tus resultados aquí.</div>
        </div>
      ) : (
        <>
          <div style={s.list}>
            {sesionesEnPagina.map((ses, i) => {
              const idxGlobal = (pagina - 1) * SESIONES_POR_PAGINA + i
              const qFS       = getVigente(cuestionarios, ses.fecha)
              const qOSIVQ    = getVigente(osivqs, ses.fecha)
              const validacion = validarTresMedodos(qFS?.resultado, qOSIVQ?.resultado, ses.estilo_cognitivo, ses.confianza)
              const abierto   = expandido === ses.id

              return (
                <div key={ses.id} style={s.card}>
                  <div style={s.row}>
                    <div style={s.rowNum}>#{sesiones.length - idxGlobal}</div>

                    <div>
                      <div style={s.rowDate}>{formatFecha(ses.fecha)}</div>
                      <div style={s.rowHora}>{formatHora(ses.fecha)}</div>
                    </div>

                    <div style={{
                      ...s.styleBadge,
                      background:  ses.estilo_cognitivo === 'Visual' ? 'rgba(0,212,170,0.1)' : ses.estilo_cognitivo === 'Verbal' ? 'rgba(59,130,246,0.1)' : 'var(--surface2)',
                      color:       ses.estilo_cognitivo === 'Visual' ? 'var(--accent)'        : ses.estilo_cognitivo === 'Verbal' ? 'var(--accent2)'       : 'var(--muted)',
                      borderColor: ses.estilo_cognitivo === 'Visual' ? 'rgba(0,212,170,0.3)'  : ses.estilo_cognitivo === 'Verbal' ? 'rgba(59,130,246,0.3)' : 'var(--border)',
                    }}>
                      {ses.estilo_cognitivo ?? 'Pendiente'}
                    </div>

                    <div style={s.confWrap}>
                      <div style={s.confLabel}>Confianza</div>
                      <div style={s.confBar}>
                        <div style={{ ...s.confFill, width: `${Math.round((ses.confianza ?? 0) * 100)}%`, background: ses.estilo_cognitivo === 'Visual' ? 'var(--accent)' : 'var(--accent2)' }} />
                      </div>
                      <div style={s.confPct}>{ses.confianza ? `${Math.round(ses.confianza * 100)}%` : '—'}</div>
                    </div>

                    <div style={s.rowMeta}>{ses.duracion}s</div>

                    {validacion ? (
                      <button
                        style={{ ...s.validBadge, background: validacion.bg, border: `1px solid ${validacion.border}`, color: validacion.color }}
                        onClick={() => setExpandido(abierto ? null : ses.id)}
                      >
                        <span>{validacion.icono}</span>
                        <span style={{ fontSize: '11px', fontWeight: 600 }}>{validacion.label}</span>
                        <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.7 }}>{abierto ? '▲' : '▼'}</span>
                      </button>
                    ) : (
                      <div style={s.sinQBadge}>Sin cuestionarios previos</div>
                    )}
                  </div>

                  {validacion && abierto && (
                    <div style={{ ...s.validPanel, borderColor: validacion.border }}>
                      <div style={s.validGrid}>
                        <div style={s.validCol}>
                          <div style={s.validColLabel}>📝 Cuestionario F-S</div>
                          {qFS ? (
                            <>
                              <div style={{ ...s.validColVal, color: qFS.resultado === 'Visual' ? 'var(--accent)' : qFS.resultado === 'Verbal' ? '#818cf8' : '#fbbf24' }}>{qFS.resultado}</div>
                              <div style={s.validColSub}>Puntaje: {qFS.puntaje > 0 ? '+' : ''}{qFS.puntaje}</div>
                              <div style={{ ...s.validColSub, marginTop: '4px' }}>Fecha: {formatFecha(qFS.fecha)}</div>
                            </>
                          ) : <div style={s.sinDatos}>Sin registro</div>}
                        </div>

                        <div style={s.validSep}>+</div>

                        <div style={s.validCol}>
                          <div style={s.validColLabel}>📋 Cuestionario OSIVQ</div>
                          {qOSIVQ ? (
                            <>
                              <div style={{ ...s.validColVal, color: qOSIVQ.resultado === 'Visual' ? 'var(--accent)' : qOSIVQ.resultado === 'Verbal' ? '#818cf8' : '#fbbf24' }}>{qOSIVQ.resultado}</div>
                              <div style={s.validColSub}>V.Obj: {qOSIVQ.puntaje_object} · Verb: {qOSIVQ.puntaje_verbal}</div>
                              <div style={{ ...s.validColSub, marginTop: '4px' }}>Fecha: {formatFecha(qOSIVQ.fecha)}</div>
                            </>
                          ) : <div style={s.sinDatos}>Sin registro</div>}
                        </div>

                        <div style={s.validSep}>vs</div>

                        <div style={s.validCol}>
                          <div style={s.validColLabel}>👁️ Prueba biométrica</div>
                          <div style={{ ...s.validColVal, color: ses.estilo_cognitivo === 'Visual' ? 'var(--accent)' : 'var(--accent2)' }}>{ses.estilo_cognitivo}</div>
                          <div style={s.validColSub}>Confianza: {Math.round((ses.confianza ?? 0) * 100)}%</div>
                          <div style={{ ...s.validColSub, marginTop: '4px' }}>Fecha: {formatFecha(ses.fecha)}</div>
                        </div>
                      </div>

                      <div style={{ ...s.veredicto, background: validacion.bg, borderColor: validacion.border }}>
                        <span style={{ fontSize: '16px' }}>{validacion.icono}</span>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: validacion.color, marginBottom: '2px' }}>{validacion.label}</div>
                          <div style={{ fontSize: '12px', color: 'var(--muted2)', lineHeight: 1.5 }}>{validacion.desc}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div style={s.paginacion}>
              <button
                style={{ ...s.pagBtn, ...(pagina === 1 ? s.pagBtnDisabled : {}) }}
                onClick={() => irPagina(pagina - 1)}
                disabled={pagina === 1}
              >
                ← Anterior
              </button>

              <div style={s.pagNums}>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    style={{ ...s.pagNum, ...(n === pagina ? s.pagNumActivo : {}) }}
                    onClick={() => irPagina(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                style={{ ...s.pagBtn, ...(pagina === totalPaginas ? s.pagBtnDisabled : {}) }}
                onClick={() => irPagina(pagina + 1)}
                disabled={pagina === totalPaginas}
              >
                Siguiente →
              </button>

              <div style={s.pagInfo}>
                {(pagina - 1) * SESIONES_POR_PAGINA + 1}–{Math.min(pagina * SESIONES_POR_PAGINA, sesiones.length)} de {sesiones.length}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const s = {
  container:  { display: 'flex', flexDirection: 'column', gap: '24px' },
  header:     { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' },
  tag:        { display: 'inline-block', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '100px', padding: '4px 12px', letterSpacing: '0.08em', marginBottom: '8px' },
  subtitle:   { fontSize: '14px', color: 'var(--muted)', margin: 0 },
  statsRow:   { display: 'flex', gap: '12px' },
  statCard:   { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 20px', textAlign: 'center', minWidth: '70px' },
  statVal:    { fontSize: '22px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text)' },
  statLabel:  { fontSize: '11px', color: 'var(--muted)', marginTop: '2px' },
  bannersWrap:{ display: 'flex', flexDirection: 'column', gap: '8px' },
  qBanner:    { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', color: 'var(--muted2)' },
  qBannerLabel:{ color: 'var(--muted)' },
  qBannerSub: { color: 'var(--muted)', fontSize: '12px' },
  list:       { display: 'flex', flexDirection: 'column', gap: '8px' },
  card:       { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' },
  row:        { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', flexWrap: 'wrap' },
  rowNum:     { fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--muted)', minWidth: '28px' },
  rowDate:    { fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text)', minWidth: '100px' },
  rowHora:    { fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)' },
  styleBadge: { fontSize: '12px', fontWeight: 600, border: '1px solid', borderRadius: '100px', padding: '4px 14px', whiteSpace: 'nowrap' },
  confWrap:   { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', minWidth: '160px' },
  confLabel:  { fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' },
  confBar:    { flex: 1, height: '4px', background: 'var(--surface2)', borderRadius: '4px', overflow: 'hidden' },
  confFill:   { height: '100%', borderRadius: '4px', transition: 'width 0.4s' },
  confPct:    { fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text)', minWidth: '36px', textAlign: 'right' },
  rowMeta:    { fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' },
  validBadge: { display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'var(--sans)', whiteSpace: 'nowrap' },
  sinQBadge:  { fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic', padding: '6px 12px' },
  validPanel:    { borderTop: '1px solid', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  validGrid:     { display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' },
  validCol:      { flex: 1, textAlign: 'center', minWidth: '100px' },
  validColLabel: { fontSize: '11px', color: 'var(--muted)', marginBottom: '6px', fontFamily: 'var(--mono)' },
  validColVal:   { fontSize: '18px', fontWeight: 700, marginBottom: '4px' },
  validColSub:   { fontSize: '11px', color: 'var(--muted)' },
  validSep:      { fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)', flexShrink: 0, paddingTop: '30px' },
  sinDatos:      { fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic' },
  veredicto:     { display: 'flex', alignItems: 'flex-start', gap: '12px', border: '1px solid', borderRadius: '8px', padding: '14px 16px' },
  empty:      { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '60px', textAlign: 'center', color: 'var(--muted)' },
  emptyIcon:  { fontSize: '40px', marginBottom: '16px' },
  emptyTitle: { fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' },
  emptyDesc:  { fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 },
  errorBox:   { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '10px', padding: '20px', color: 'var(--danger)', fontSize: '14px' },

  // Paginación
  paginacion:    { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' },
  pagBtn:        { padding: '8px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted2)', fontSize: '13px', fontFamily: 'var(--sans)', cursor: 'pointer' },
  pagBtnDisabled:{ opacity: 0.4, cursor: 'not-allowed' },
  pagNums:       { display: 'flex', gap: '4px' },
  pagNum:        { width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted2)', fontSize: '13px', fontFamily: 'var(--mono)', cursor: 'pointer' },
  pagNumActivo:  { background: 'var(--accent)', border: '1px solid var(--accent)', color: '#020c08', fontWeight: 700 },
  pagInfo:       { fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)', marginLeft: '8px' },
}