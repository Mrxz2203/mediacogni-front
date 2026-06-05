import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/inicio',    label: 'Inicio',    icon: HomeIcon },
  { to: '/perfil',    label: 'Perfil',    icon: UserIcon },
  { to: '/sistema',   label: 'Sistema',   icon: EyeIcon },
  { to: '/historial', label: 'Historial', icon: ClockIcon },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        <div>
          <div style={styles.logoName}>V-COGNI</div>
          <div style={styles.logoSub}>Eye Tracking System</div>
        </div>
      </div>

      <div style={styles.divider} />

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navLabel}>MENÚ</div>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            ...styles.navItem,
            ...(isActive ? styles.navItemActive : {}),
          })}>
            {({ isActive }) => (
              <>
                <span style={{ ...styles.navIcon, ...(isActive ? styles.navIconActive : {}) }}>
                  <Icon />
                </span>
                <span>{label}</span>
                {isActive && <span style={styles.activeDot} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={styles.footer}>
        {user && (
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>{user.nombre?.charAt(0).toUpperCase()}</div>
            <div>
              <div style={styles.userName}>{user.nombre}</div>
              <div style={styles.userRol}>{user.rol}</div>
            </div>
          </div>
        )}
        <div style={styles.divider} />
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogoutIcon />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}


function HomeIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg> }
function UserIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function EyeIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> }
function ClockIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg> }
function LogoutIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }

const styles = {
  sidebar: { width: 'var(--sidebar-w)', minHeight: '100vh', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  logo: { display: 'flex', alignItems: 'center', gap: '12px', padding: '24px 20px' },
  logoIcon: { width: '38px', height: '38px', background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoName: { fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' },
  logoSub: { fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.03em' },
  divider: { height: '1px', background: 'var(--border)', margin: '0 16px' },
  nav: { flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '2px' },
  navLabel: { fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--muted)', letterSpacing: '0.12em', padding: '0 8px', marginBottom: '8px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: 400, color: 'var(--muted2)', transition: 'all 0.15s', position: 'relative' },
  navItemActive: { background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 500 },
  navIcon: { display: 'flex', alignItems: 'center', color: 'var(--muted)' },
  navIconActive: { color: 'var(--accent)' },
  activeDot: { width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', marginLeft: 'auto' },
  footer: { padding: '0 0 16px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px' },
  userAvatar: { width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 },
  userName: { fontSize: '13px', fontWeight: 500, color: 'var(--text)' },
  userRol: { fontSize: '10px', color: 'var(--muted)', textTransform: 'capitalize' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', marginTop: '8px', background: 'none', border: 'none', color: 'var(--muted)', fontSize: '13px', width: '100%', cursor: 'pointer' },
}