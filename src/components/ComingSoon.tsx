export default function ComingSoon({ title }: { title: string }) {
  return (
    <main style={{
      flex: 1,
      minHeight: 'calc(100vh - 64px)',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    }}>
      <div style={{
        fontSize: 11,
        letterSpacing: '0.2em',
        color: 'rgba(255,255,255,0.25)',
        fontFamily: 'sans-serif',
        textTransform: 'uppercase',
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 'clamp(28px, 4vw, 42px)',
        fontFamily: "'Blue Screen', 'Courier New', monospace",
        color: '#fff',
        letterSpacing: 4,
        textAlign: 'center',
      }}>
        WORK IN PROGRESS
      </div>
      <div style={{
        width: 40,
        height: 1,
        background: '#c0392b',
        marginTop: 4,
      }} />
      <p style={{
        fontSize: 13,
        color: 'rgba(255,255,255,0.3)',
        fontFamily: 'sans-serif',
        marginTop: 4,
      }}>
        Check back soon.
      </p>
    </main>
  )
}
