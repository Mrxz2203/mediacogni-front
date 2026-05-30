import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Historial() {
  const { getMisSesiones, user } = useAuth()
  const [sesiones, setSesiones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
              {sesiones.filter(s => s.estilo_cognitivo === 'Visual').length}
            </div>
            <div style={s.statLabel}>Visual</div>
          </div>
          <div style={s.statCard}>
            <div style={{ ...s.statVal, color: 'var(--accent2)' }}>
              {sesiones.filter(s => s.estilo_cognitivo === 'Verbal').length}
            </div>
            <div style={s.statLabel}>Verbal</div>
          </div>
        </div>
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
        <div style={s.list}>
          {sesiones.map((ses, i) => (
            <div key={ses.id} style={s.row}>
              {/* Número */}
              <div style={s.rowNum}>#{sesiones.length - i}</div>

              {/* Fecha */}
              <div>
                <div style={s.rowDate}>{formatFecha(ses.fecha)}</div>
                <div style={s.rowHora}>{formatHora(ses.fecha)}</div>
              </div>

              {/* Estilo */}
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
            </div>
          ))}
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
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  row: { display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' },
  rowNum: { fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--muted)', minWidth: '28px' },
  rowDate: { fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text)', minWidth: '100px' },
  rowHora: { fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)' },
  styleBadge: { fontSize: '12px', fontWeight: 600, border: '1px solid', borderRadius: '100px', padding: '4px 14px', whiteSpace: 'nowrap' },
  confWrap: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px' },
  confLabel: { fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' },
  confBar: { flex: 1, height: '4px', background: 'var(--surface2)', borderRadius: '4px', overflow: 'hidden' },
  confFill: { height: '100%', borderRadius: '4px', transition: 'width 0.4s' },
  confPct: { fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text)', minWidth: '36px', textAlign: 'right' },
  rowMeta: { fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' },
  empty: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '60px', textAlign: 'center', color: 'var(--muted)' },
  emptyIcon: { fontSize: '40px', marginBottom: '16px' },
  emptyTitle: { fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' },
  emptyDesc: { fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 },
  errorBox: { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '10px', padding: '20px', color: 'var(--danger)', fontSize: '14px' },
}