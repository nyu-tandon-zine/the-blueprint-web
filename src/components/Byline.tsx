import Link from 'next/link'
import type { Credit } from '@/types'
import { contributorPath } from '@/lib/credits'

/**
 * Renders a work's authors as "Ana, Ben & Cy", each linking to their
 * contributor page. Pass credits already sorted (sortedCredits()).
 *
 * `linked={false}` renders plain names — use it inside something that is
 * already a link (e.g. homepage work rows), since <a> can't nest.
 *
 * No 'use client' needed: it has no state, so it works from both server
 * and client components.
 */
export default function Byline({
  credits,
  linked = true,
  linkClassName = 'underline decoration-1 underline-offset-4 decoration-current/30 hover:decoration-current transition-colors',
}: {
  credits: Credit[]
  linked?: boolean
  linkClassName?: string
}) {
  if (credits.length === 0) return null

  return (
    <>
      {credits.map((c, i) => {
        const sep = i === 0 ? '' : i === credits.length - 1 ? ' & ' : ', '
        const label = c.role ? `${c.author.name} (${c.role})` : c.author.name
        return (
          <span key={c.author.id}>
            {sep}
            {linked ? (
              <Link href={contributorPath(c.author.slug)} className={linkClassName}>
                {label}
              </Link>
            ) : (
              label
            )}
          </span>
        )
      })}
    </>
  )
}
