import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const NAV_ESTUDIANTE = [
  { to: '/inicio',        label: 'Inicio',       icon: HomeIcon },
  { to: '/perfil',        label: 'Perfil',        icon: UserIcon },
  { to: '/cuestionario',  label: 'Cuestionario F-S',  icon: QuizIcon },
  { to: '/cuestionario-osivq', label: 'Cuestionario OSIVQ',          icon: OsivqIcon },
  { to: '/sistema',       label: 'Sistema',       icon: EyeIcon },
  { to: '/historial',     label: 'Historial',     icon: ClockIcon },
]

const NAV_ADMIN = [
  { to: '/inicio',         label: 'Inicio',            icon: HomeIcon },
  { to: '/perfil',         label: 'Perfil',             icon: UserIcon },
  { to: '/admin/usuarios', label: 'Gestionar Usuarios', icon: UsersIcon },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const NAV = user?.rol === 'admin' ? NAV_ADMIN : NAV_ESTUDIANTE

const [showLogout, setShowLogout] = useState(false)

const handleLogout = () => {
  logout()
  navigate('/')
}

  return (
     <>
    <aside style={styles.sidebar}>
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
<button onClick={() => setShowLogout(true)} style={styles.logoutBtn}>
  <LogoutIcon />
  <span>Cerrar sesión</span>
</button>
</div>
</aside>

 {/* Modal confirmación logout */}
{showLogout && (
  <div style={styles.modalOverlay}>
    <div style={styles.modalBox}>
      <h3 style={styles.modalTitle}>¿Cerrar sesión?</h3>
      <p style={styles.modalDesc}>Tu sesión actual se cerrará.</p>
      <div style={styles.modalBtns}>
        <button style={styles.modalCancel} onClick={() => setShowLogout(false)}>
          Cancelar
        </button>
        <button style={styles.modalConfirm} onClick={handleLogout}>
          Sí, salir
        </button>
      </div>
    </div>
  </div>
  )}
    </>
  )
}

function HomeIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg> }
function UserIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function QuizIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg> }
function EyeIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> }
function ClockIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg> }
function UsersIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
function LogoutIcon(){ return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }
function OsivqIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> }
const styles = {
  sidebar:      { width: 'var(--sidebar-w)', minHeight: '100vh', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  logo:         { display: 'flex', alignItems: 'center', gap: '12px', padding: '24px 20px' },
  logoIcon:     { width: '38px', height: '38px', background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoName:     { fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' },
  logoSub:      { fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.03em' },
  divider:      { height: '1px', background: 'var(--border)', margin: '0 16px' },
  nav:          { flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '2px' },
  navLabel:     { fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--muted)', letterSpacing: '0.12em', padding: '0 8px', marginBottom: '8px' },
  navItem:      { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: 400, color: 'var(--muted2)', transition: 'all 0.15s', position: 'relative', textDecoration: 'none' },
  navItemActive:{ background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 500 },
  navIcon:      { display: 'flex', alignItems: 'center', color: 'var(--muted)' },
  navIconActive:{ color: 'var(--accent)' },
  activeDot:    { width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', marginLeft: 'auto' },
  footer:       { padding: '0 0 16px' },
  userInfo:     { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px' },
  userAvatar:   { width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 },
  userName:     { fontSize: '13px', fontWeight: 500, color: 'var(--text)' },
  userRol:      { fontSize: '10px', color: 'var(--muted)', textTransform: 'capitalize' },
  logoutBtn:    { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', marginTop: '8px', background: 'none', border: 'none', color: 'var(--muted)', fontSize: '13px', width: '100%', cursor: 'pointer' },
modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
modalBox:     { background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-lg)', padding: '28px', width: '260px' },
modalTitle:   { fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--text)' },
modalDesc:    { fontSize: '13px', color: 'var(--muted2)', marginBottom: '20px' },
modalBtns:    { display: 'flex', gap: '10px' },
modalCancel:  { flex: 1, padding: '9px', background: 'none', border: '1px solid var(--border2)', borderRadius: '8px', color: 'var(--muted2)', fontSize: '13px', fontFamily: 'var(--sans)', cursor: 'pointer' },
modalConfirm: { flex: 1, padding: '9px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--sans)', cursor: 'pointer' },
}