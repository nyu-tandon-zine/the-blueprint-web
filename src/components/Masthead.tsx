import type { Masthead as MastheadData } from '@/content/masthead'

/** The zine team, as plain names (no links). */
export default function Masthead({ masthead }: { masthead: MastheadData }) {
  return (
    <section id="masthead" className="mt-24 scroll-mt-24 text-center">
      <h2
        className="uppercase"
        style={{
          fontFamily: 'var(--font-blue-screen)',
          fontSize: 'clamp(24px, 5vw, 34px)',
          letterSpacing: 4,
        }}
      >
        Masthead
      </h2>
      {/* New Science, not Blue Screen: the Blue Screen demo font has no real digits */}
      <p
        className="mt-2 text-[13px] uppercase text-white/45"
        style={{ fontFamily: 'var(--font-new-science)', letterSpacing: 3 }}
      >
        {masthead.semester}
      </p>
      <div className="mx-auto mt-4 mb-12 h-px w-10 bg-[#c0392b]" />

      {masthead.groups.map((group) => (
        <div key={group.heading} className="mb-14">
          <h3
            className="mb-8 text-xl text-white"
            style={{ fontFamily: 'var(--font-new-science)', letterSpacing: 2 }}
          >
            {group.heading}
          </h3>
          <dl className="space-y-6">
            {group.roles.map((role) => (
              <div key={role.title}>
                <dt
                  className="mb-1 text-[11px] uppercase text-[#e74c3c]/80"
                  style={{ fontFamily: 'sans-serif', letterSpacing: 2 }}
                >
                  {role.title}
                </dt>
                <dd
                  className="mx-auto max-w-[620px] text-[15px] leading-relaxed text-white/80"
                  style={{ fontFamily: 'sans-serif' }}
                >
                  {role.people.join(', ')}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </section>
  )
}
