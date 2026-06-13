import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

// ── Lógica de validación cruzada ──────────────────────────────────────────────
function validarCruzado(resultadoCuestionario, estiloBiometrico, confianza) {
  if (!resultadoCuestionario || !estiloBiometrico) return null

  const confianzaPct = Math.round((confianza ?? 0) * 100)
  const biometricoIncierto = confianzaPct < 60

  // Regla 1: cuestionario verbal + biométrico incierto → DESCARTAR
  if (resultadoCuestionario === 'Verbal' && biometricoIncierto) {
    return {
      estado: 'descartado',
      icono: '❌',
      label: 'Resultado descartado',
      desc: 'El cuestionario indica perfil Verbal pero la prueba biométrica no fue concluyente.',
      color: '#f87171',
      bg: 'rgba(248,113,113,0.08)',
      border: 'rgba(248,113,113,0.25)',
    }
  }

  // Regla 2: ambos coinciden → CONFIRMADO
  if (resultadoCuestionario === estiloBiometrico) {
    return {
      estado: 'confirmado',
      icono: '✅',
      label: 'Confirmado con alta confianza',
      desc: `Ambos métodos coinciden en perfil ${estiloBiometrico}.`,
      color: 'var(--accent)',
      bg: 'rgba(0,212,170,0.08)',
      border: 'rgba(0,212,170,0.25)',
    }
  }

  // Regla 3: balanceado en cuestionario pero biométrico define → ACEPTADO CON NOTA
  if (resultadoCuestionario === 'Balanceado') {
    return {
      estado: 'aceptado',
      icono: '📊',
      label: 'Perfil definido por biométrico',
      desc: `El cuestionario indicó perfil Balanceado. La prueba biométrica clasificó como ${estiloBiometrico}.`,
      color: '#fbbf24',
      bg: 'rgba(251,191,36,0.08)',
      border: 'rgba(251,191,36,0.25)',
    }
  }

  // Regla 4: discrepancia entre cuestionario y biométrico
  return {
    estado: 'discrepancia',
    icono: '⚠️',
    label: 'Discrepancia leve',
    desc: `El cuestionario indica ${resultadoCuestionario} pero la prueba biométrica clasificó como ${estiloBiometrico}. Se recomienda repetir la prueba.`,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.25)',
  }
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Historial() {
  const { getMisSesiones, user, cuestionarioCompletado } = useAuth()
  const [sesiones, setSesiones] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [expandido, setExpandido] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getMisSesiones()
        setSesiones(data)
      } catch {
        setError('No se pudo cargar el historial.')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const formatFecha = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatHora = (iso) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
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

      {/* Cuestionario completado banner */}
      {cuestionarioCompletado && (
        <div style={s.qBanner}>
          <span style={s.qBannerIcon}>📝</span>
          <div>
            <span style={s.qBannerLabel}>Cuestionario F-S completado — </span>
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
              {cuestionarioCompletado.resultado}
            </span>
            <span style={s.qBannerPuntaje}>
              {' '}(puntaje: {cuestionarioCompletado.puntaje > 0 ? '+' : ''}{cuestionarioCompletado.puntaje})
            </span>
          </div>
        </div>
      )}

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
        <div style={s.list}>
          {sesiones.map((ses, i) => {
            const validacion = validarCruzado(
              cuestionarioCompletado?.resultado,
              ses.estilo_cognitivo,
              ses.confianza
            )
            const abierto = expandido === ses.id

            return (
              <div key={ses.id} style={s.card}>
                {/* Fila principal */}
                <div style={s.row}>
                  {/* Número */}
                  <div style={s.rowNum}>#{sesiones.length - i}</div>

                  {/* Fecha */}
                  <div>
                    <div style={s.rowDate}>{formatFecha(ses.fecha)}</div>
                    <div style={s.rowHora}>{formatHora(ses.fecha)}</div>
                  </div>

                  {/* Estilo biométrico */}
                  <div style={{
                    ...s.styleBadge,
                    background: ses.estilo_cognitivo === 'Visual'
                      ? 'rgba(0,212,170,0.1)' : ses.estilo_cognitivo === 'Verbal'
                      ? 'rgba(59,130,246,0.1)' : 'var(--surface2)',
                    color: ses.estilo_cognitivo === 'Visual'
                      ? 'var(--accent)' : ses.estilo_cognitivo === 'Verbal'
                      ? 'var(--accent2)' : 'var(--muted)',
                    borderColor: ses.estilo_cognitivo === 'Visual'
                      ? 'rgba(0,212,170,0.3)' : ses.estilo_cognitivo === 'Verbal'
                      ? 'rgba(59,130,246,0.3)' : 'var(--border)',
                  }}>
                    {ses.estilo_cognitivo ?? 'Pendiente'}
                  </div>

                  {/* Confianza */}
                  <div style={s.confWrap}>
                    <div style={s.confLabel}>Confianza</div>
                    <div style={s.confBar}>
                      <div style={{
                        ...s.confFill,
                        width: `${Math.round((ses.confianza ?? 0) * 100)}%`,
                        background: ses.estilo_cognitivo === 'Visual' ? 'var(--accent)' : 'var(--accent2)',
                      }} />
                    </div>
                    <div style={s.confPct}>
                      {ses.confianza ? `${Math.round(ses.confianza * 100)}%` : '—'}
                    </div>
                  </div>

                  {/* Duración */}
                  <div style={s.rowMeta}>{ses.duracion}s</div>

                  {/* Validación badge + toggle */}
                  {validacion && (
                    <button
                      style={{ ...s.validBadge, background: validacion.bg, border: `1px solid ${validacion.border}`, color: validacion.color }}
                      onClick={() => setExpandido(abierto ? null : ses.id)}
                    >
                      <span>{validacion.icono}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600 }}>{validacion.label}</span>
                      <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.7 }}>{abierto ? '▲' : '▼'}</span>
                    </button>
                  )}
                </div>

                {/* Panel expandible de validación cruzada */}
                {validacion && abierto && (
                  <div style={{ ...s.validPanel, borderColor: validacion.border }}>
                    <div style={s.validGrid}>
                      {/* Cuestionario */}
                      <div style={s.validCol}>
                        <div style={s.validColLabel}>📝 Cuestionario F-S</div>
                        <div style={{ ...s.validColVal, color: validacion.color }}>
                          {cuestionarioCompletado?.resultado}
                        </div>
                        <div style={s.validColSub}>
                          Puntaje: {cuestionarioCompletado?.puntaje > 0 ? '+' : ''}{cuestionarioCompletado?.puntaje}
                        </div>
                      </div>

                      {/* Separador */}
                      <div style={s.validSep}>vs</div>

                      {/* Biométrico */}
                      <div style={s.validCol}>
                        <div style={s.validColLabel}>👁️ Prueba biométrica</div>
                        <div style={{ ...s.validColVal, color: ses.estilo_cognitivo === 'Visual' ? 'var(--accent)' : 'var(--accent2)' }}>
                          {ses.estilo_cognitivo}
                        </div>
                        <div style={s.validColSub}>
                          Confianza: {Math.round((ses.confianza ?? 0) * 100)}%
                        </div>
                      </div>
                    </div>

                    {/* Veredicto */}
                    <div style={{ ...s.veredicto, background: validacion.bg, borderColor: validacion.border }}>
                      <span style={{ fontSize: '16px' }}>{validacion.icono}</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: validacion.color, marginBottom: '2px' }}>
                          {validacion.label}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--muted2)', lineHeight: 1.5 }}>
                          {validacion.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const s = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' },
  tag: { display: 'inline-block', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '100px', padding: '4px 12px', letterSpacing: '0.08em', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: 'var(--muted)', margin: 0 },
  statsRow: { display: 'flex', gap: '12px' },
  statCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 20px', textAlign: 'center', minWidth: '70px' },
  statVal: { fontSize: '22px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text)' },
  statLabel: { fontSize: '11px', color: 'var(--muted)', marginTop: '2px' },

  qBanner: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', color: 'var(--muted2)' },
  qBannerIcon: { fontSize: '16px' },
  qBannerLabel: { color: 'var(--muted)' },
  qBannerPuntaje: { color: 'var(--muted)', fontSize: '12px' },

  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' },
  row: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', flexWrap: 'wrap' },
  rowNum: { fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--muted)', minWidth: '28px' },
  rowDate: { fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text)', minWidth: '100px' },
  rowHora: { fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)' },
  styleBadge: { fontSize: '12px', fontWeight: 600, border: '1px solid', borderRadius: '100px', padding: '4px 14px', whiteSpace: 'nowrap' },
  confWrap: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', minWidth: '160px' },
  confLabel: { fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' },
  confBar: { flex: 1, height: '4px', background: 'var(--surface2)', borderRadius: '4px', overflow: 'hidden' },
  confFill: { height: '100%', borderRadius: '4px', transition: 'width 0.4s' },
  confPct: { fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text)', minWidth: '36px', textAlign: 'right' },
  rowMeta: { fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' },

  validBadge: { display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'var(--sans)', whiteSpace: 'nowrap' },

  validPanel: { borderTop: '1px solid', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  validGrid: { display: 'flex', alignItems: 'center', gap: '24px' },
  validCol: { flex: 1, textAlign: 'center' },
  validColLabel: { fontSize: '11px', color: 'var(--muted)', marginBottom: '6px', fontFamily: 'var(--mono)' },
  validColVal: { fontSize: '18px', fontWeight: 700, marginBottom: '4px' },
  validColSub: { fontSize: '11px', color: 'var(--muted)' },
  validSep: { fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)', flexShrink: 0 },

  veredicto: { display: 'flex', alignItems: 'flex-start', gap: '12px', border: '1px solid', borderRadius: '8px', padding: '14px 16px' },

  empty: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '60px', textAlign: 'center', color: 'var(--muted)' },
  emptyIcon: { fontSize: '40px', marginBottom: '16px' },
  emptyTitle: { fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' },
  emptyDesc: { fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 },
  errorBox: { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '10px', padding: '20px', color: 'var(--danger)', fontSize: '14px' },
}