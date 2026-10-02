import type { CSSProperties } from 'react'

const baseBtn: CSSProperties = {
  fontFamily: "'Blue Screen', 'Courier New', monospace",
  fontSize: 13,
  letterSpacing: 2,
  padding: '10px 20px',
  textDecoration: 'none',
  border: '1px solid #c0392b',
}

const primaryBtn: CSSProperties = {
  ...baseBtn,
  background: '#c0392b',
  color: '#fff',
}

const secondaryBtn: CSSProperties = {
  ...baseBtn,
  background: 'transparent',
  color: '#fff',
}

export default function AboutPage() {
  return (
    <main style={{
      flex: 1,
      minHeight: 'calc(100vh - 64px)',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      padding: '100px 24px 0',
    }}>
      <div style={{
        fontSize: 'clamp(28px, 6vw, 42px)',
        fontFamily: "'Blue Screen', 'Courier New', monospace",
        color: '#fff',
        letterSpacing: 4,
        textAlign: 'center',
      }}>
        ABOUT THE ZINE
      </div>
      <div style={{
        width: 40,
        height: 1,
        background: '#c0392b',
        marginTop: 4,
      }} />
      <p style={{
        fontSize: 16,
        color: 'rgba(255,255,255)',
        fontFamily: 'sans-serif',
        marginTop: 4,
        textAlign: 'center',
        maxWidth: 640, 
      }}>
        The Blueprint is a student-run zine at the NYU Tandon School of Engineering that showcases NYU students&apos; engagement with the arts and sciences through creative work. Our mission is to foster curiosity, critical thinking, and creativity within Tandon, across NYU, and beyond.
        <br /><br />
        Each issue builds on the legacy of student-curated publications of writing and artwork at Tandon and its predecessor, the Polytechnic Institute of Brooklyn. While our focus is our home school, Tandon, we welcome submissions from students across all of NYU.
        <br /><br />
      </p>
      <div style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 8,
      }}>
        <a 
          href="https://docs.google.com/forms/d/e/1FAIpQLScX5KzwZgT9c56iO0QuyttJUuuiD_AUAI0uERmjGZzDRJYomg/viewform"
          target="_blank"
          rel="noopener noreferrer" 
          style={primaryBtn}
        >
          SUBMIT YOUR WORK
        </a>
        <a 
          href="https://docs.google.com/document/d/18t4-Gp59C3ECms3wElxV0MKhBbAskvHjflXcSJdzaGs/edit?usp=sharing" 
          target="_blank"
          rel="noopener noreferrer"
          style={secondaryBtn}
        >
          AI POLICY
        </a>
      </div>
    </main>
  )
}
