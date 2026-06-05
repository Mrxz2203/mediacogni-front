import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

const PAGE_TITLES = {
  '/inicio':          'Inicio',
  '/perfil':          'Perfil',
  '/sistema':         'Sistema — V-COGNI',
  '/sistema/sesion':  'Sesión en vivo',
  '/historial':       'Historial',
}

export default function Layout() {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? 'V-COGNI'

  return (
    <div style={styles.root}>
      <Sidebar />

      <div style={styles.main}>
        {/* Top header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>{title}</h1>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.badge}>
              <span style={styles.dot} />
              <span style={styles.badgeText}>Sistema activo</span>
            </div>
            <div style={styles.avatar}>GG</div>
          </div>
        </header>

        {/* Page content */}
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const styles = {
  root: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: 'var(--bg)',
  },
  header: {
    height: 'var(--header-h)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    background: 'var(--surface)',
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: '16px',
    fontWeight: 500,
    color: 'var(--text)',
    letterSpacing: '-0.01em',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--accent-dim)',
    border: '1px solid rgba(0,212,170,0.2)',
    borderRadius: '100px',
    padding: '4px 12px',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--accent)',
    animation: 'pulse 2s infinite',
  },
  badgeText: {
    fontSize: '11px',
    fontFamily: 'var(--mono)',
    color: 'var(--accent)',
    letterSpacing: '0.05em',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'var(--surface3)',
    border: '1px solid var(--border2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--muted2)',
    fontFamily: 'var(--mono)',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '32px 28px',
  },
}