import type { Work } from '@/types'

/**
 * TextFormatter — auto-formats article display following the Blueprint Design Guidelines.
 *
 * Typography hierarchy (from DesignGuidelines.pdf p.11):
 *   H1 — Section Title  → Blue Screen (primary typeface)
 *   H2 — Page Title      → New Science
 *   H3 — Subtitle        → New Science italic
 *   H4 — Subheading      → New Science bold uppercase
 *   P  — Body            → Motiva
 *
 * Until the custom font files are added to public/fonts/, fallback fonts are used:
 *   Blue Screen  → Courier New (monospace/retro feel)
 *   New Science  → Geist / system sans-serif
 *   Motiva       → Geist / system sans-serif
 */

// ── Style tokens mapped from CSS variables ───────────────────────────────

const styles = {
  // H1 — Section title (Blue Screen)
  sectionTitle: {
    fontFamily: 'var(--font-blue-screen)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  // H2 — Page title (New Science)
  pageTitle: {
    fontFamily: 'var(--font-new-science)',
    fontWeight: 400,
  },
  // H3 — Subtitle / author (New Science italic)
  subtitle: {
    fontFamily: 'var(--font-new-science)',
    fontStyle: 'italic' as const,
  },
  // H4 — Subheading (New Science bold uppercase)
  subheading: {
    fontFamily: 'var(--font-new-science)',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  },
  // P — Body text (Motiva)
  body: {
    fontFamily: 'var(--font-motiva)',
  },
}

// ── Shared header block ──────────────────────────────────────────────────

export function ArticleHeader({
  work,
  color = 'default',
}: {
  work: Work
  color?: 'default' | 'blue' | 'red'
}) {
  const palette = {
    default: {
      genre: 'text-gray-400',
      title: 'text-gray-900',
      author: 'text-gray-600',
      date: 'text-gray-400',
    },
    blue: {
      genre: 'text-bp-blue-3',
      title: 'text-bp-off-white',
      author: 'text-bp-blue-3',
      date: 'text-bp-blue-3',
    },
    red: {
      genre: 'text-bp-red-3',
      title: 'text-bp-off-white',
      author: 'text-bp-red-3',
      date: 'text-bp-red-3',
    },
  }[color]

  const date = work.created_at
    ? new Date(work.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <header className="mb-10">
      {/* Genre label — H4 style */}
      <p
        className={`text-xs tracking-widest mb-4 ${palette.genre}`}
        style={styles.subheading}
      >
        {work.genre}
      </p>

      {/* Title — H2 style */}
      <h1
        className={`text-4xl md:text-5xl leading-tight mb-3 ${palette.title}`}
        style={styles.pageTitle}
      >
        {work.title}
      </h1>

      {/* Author — H3 style */}
      {work.author?.name && (
        <p
          className={`text-lg mb-1 ${palette.author}`}
          style={styles.subtitle}
        >
          By {work.author.name}
        </p>
      )}

      {/* Date */}
      {date && (
        <p
          className={`text-sm ${palette.date}`}
          style={styles.body}
        >
          {date}
        </p>
      )}
    </header>
  )
}

// ── Prose body formatter ─────────────────────────────────────────────────

export function ProseBody({ content }: { content: string }) {
  return (
    <div
      className="max-w-none text-gray-800 leading-relaxed space-y-5 text-base break-words"
      style={styles.body}
    >
      {content.split('\n\n').map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  )
}

// ── Poetry body formatter ────────────────────────────────────────────────

export function PoetryBody({ content }: { content: string }) {
  return (
    <div
      className="text-gray-800 text-base leading-8 whitespace-pre-wrap break-words"
      style={styles.body}
    >
      {content}
    </div>
  )
}

// ── Works Cited formatter ────────────────────────────────────────────────

export function WorksCited({ text }: { text: string }) {
  return (
    <div className="mt-16">
      <hr className="border-gray-200 mb-6" />
      <h2
        className="text-lg text-gray-900 mb-3"
        style={styles.subheading}
      >
        Works Cited
      </h2>
      <div
        className="text-sm text-gray-600 leading-relaxed space-y-2"
        style={styles.body}
      >
        {text.split('\n').map((entry, i) => (
          <p key={i}>{entry}</p>
        ))}
      </div>
    </div>
  )
}

// ── Section title (H1 — Blue Screen) ─────────────────────────────────────

export function SectionTitle({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h1
      className={`text-5xl md:text-6xl text-bp-blue ${className}`}
      style={styles.sectionTitle}
    >
      {children}
    </h1>
  )
}

// ── Re-export styles for use in previews / other components ──────────────
export { styles as blueprintStyles }
