export default function Profile() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.avatar}>GG</div>
        <div>
          <div style={styles.name}>Estudiante</div>
          <div style={styles.role}>Universidad — Educación Superior</div>
        </div>
      </div>
      <div style={styles.placeholder}>
        Sección de perfil — próximamente con datos del usuario y configuración.
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  card: {
    display: 'flex', alignItems: 'center', gap: '20px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '28px',
  },
  avatar: {
    width: '64px', height: '64px', borderRadius: '50%',
    background: 'var(--accent-dim)', border: '1px solid rgba(0,212,170,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', fontWeight: 700, color: 'var(--accent)',
    fontFamily: 'var(--mono)',
  },
  name: { fontSize: '18px', fontWeight: 600, marginBottom: '4px' },
  role: { fontSize: '13px', color: 'var(--muted)' },
  placeholder: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '28px',
    color: 'var(--muted)', fontSize: '14px',
  },
}