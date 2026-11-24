import type { CSSProperties } from 'react'
import { SUBMISSION_FORM_URL, AI_POLICY_URL } from '@/lib/links'

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

// Team data array
const teamMembers = [
  { name: "Konstantina Sezenia", role: "Overall Team Manager" },
  { name: "Nikhita Bolineli", role: "Editorial Team Manager" },
  { name: "Emma Ozdogan", role: "Editorial Team Manager" },
  { name: "Perry Adofo", role: "Editorial Team Member" },
  { name: "Emily Bonner", role: "Editorial Team Member" },
  { name: "Casey Dalicandro", role: "Editorial Team Member" },
  { name: "Vaishnavi Girish", role: "Editorial Team Member" },
  { name: "Evalia Koumpourlis", role: "Editorial Team Member" },
  { name: "Tyler Mak", role: "Editorial Team Member" },
  { name: "Nat Nylaende", role: "Editorial Team Member" },
  { name: "Carter Scott", role: "Editorial Team Member" },
  { name: "Srividhya Chandramouleeswaran", role: "Design Team Manager" },
  { name: "Ellie Lennon", role: "Design Team Manager" },
  { name: "Bersu Berker", role: "Design Team Member" },
  { name: "Stacey Chen", role: "Design Team Member" },
  { name: "Lara Ozdogan", role: "Design Team Member" },
  { name: "David Yang", role: "Design Team Member" },
  { name: "Garrik Vertsaman", role: "Web Development Team Manager" },
  { name: "Xufei (Felix) Zhang", role: "Web Development Team Manager" },
  { name: "Jake Giuliana", role: "Web Development Team Member" },
  { name: "Adam Kobor", role: "Web Development Team Member" },
  { name: "Chloe Miao", role: "Web Development Team Member" },
  { name: "Connor Ng", role: "Web Development Team Member" },
  { name: "Eric Shao", role: "Web Development Team Member" },

]

// 1. A helper function that returns a border color based on the role string
const getBorderColor = (role: string) => {
  // Convert to lowercase so capitalization doesn't break it
  const lowerRole = role.toLowerCase()

  if (lowerRole.includes('overall')) {
    return '#7C0A19' 
  } else if (lowerRole.includes('editorial')) {
    return '#B6CCFF' 
  } else if (lowerRole.includes('design')) {
    return '#E5042C' 
  } else {
    return '#2B22C8' 
  }
}

const getNameStyle = (role: string) => {
  const lowerRole = role.toLowerCase()

  if (lowerRole.includes('manager')) {
    const matchColor = getBorderColor(role)
    return {
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
      textDecorationColor: matchColor,
    }
  }

  return {} 
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
      padding: '100px 24px 80px',
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
        color: 'rgba(255,255,255,0.85)',
        fontFamily: 'sans-serif',
        marginTop: 4,
        textAlign: 'center',
        maxWidth: 640, 
      }}>
        The Blueprint is a student-run zine at the NYU Tandon School of Engineering that showcases NYU students&apos; engagement with the arts and sciences through creative work. Our mission is to foster curiosity, critical thinking, and creativity within Tandon, across NYU, and beyond.
        <br /><br />
        Each issue builds on the legacy of student-curated publications of writing and artwork at Tandon and its predecessor, the Polytechnic Institute of Brooklyn. While our focus is our home school, Tandon, we welcome submissions from students across all of NYU.
      </p>

      {/* Buttons Section */}
      <div style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 8,
      }}>
        <a 
          href={SUBMISSION_FORM_URL}
          target="_blank"
          rel="noopener noreferrer" 
          style={primaryBtn}
        >
          SUBMIT YOUR WORK
        </a>
        <a 
          href={AI_POLICY_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={secondaryBtn}
        >
          AI POLICY
        </a>
      </div>

      {/* Meet the Team Section */}
      <section style={{
        marginTop: 64,
        width: '100%',
        maxWidth: 720,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 32,
      }}>
        <div style={{
          fontSize: 'clamp(20px, 6vw, 34px)',
          fontFamily: "'Blue Screen', 'Courier New', monospace",
          color: '#fff',
          letterSpacing: 3,
          textAlign: 'center',
        }}>
          MEET THE TEAM
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20,
          width: '100%',
        }}>
          {teamMembers.map((member, index) => {
            // 2. Call helper function for team member's role
            const borderColor = getBorderColor(member.role)
            const nameStyle = getNameStyle(member.role)

            return (
              <div 
                key={index} 
                className="transition-transform duration-200 hover:-translate-y-1"
                style={{
                  background: '#121212',
                  // 3. Dynamically inject the color returned by the function
                  border: `1px solid ${borderColor}`,
                  padding: '28px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div style={{
                  fontFamily: "'Blue Screen', 'Courier New', monospace",
                  color: '#fff',
                  fontSize: 14,
                  letterSpacing: 1,
                  textAlign: 'center',
                  ...nameStyle,
                }}>
                  {member.name}
                </div>
                <div style={{
                  fontFamily: 'sans-serif',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 12,
                  textAlign: 'center',
                }}>
                  {member.role}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}