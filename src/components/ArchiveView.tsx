import Link from 'next/link'
import type { CSSProperties } from 'react'
import type { Issue } from '@/types'
import styles from './ArchiveView.module.css'

type Props = {
  issues: Issue[]
  columns?: number          // boxes per row; defaults to 3
}

export default function ArchiveView({ issues, columns = 3 }: Props) {
  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Archive</h1>

      {issues.length === 0 ? (
        <p className={styles.empty}>No past issues yet.</p>
      ) : (
        <ul
          className={styles.grid}
          style={{ '--cols': columns } as CSSProperties}
        >
          {issues.map((issue, i) => (
            <li key={issue.id} className={styles.card}>
              <Corners />

              <Link href={`/archive/${issue.id}`} className={styles.link}>
                <span className={styles.index}>
                  {String(issues.length - i).padStart(2, '0')}
                </span>

                {/* White 8.5×11 mockup; shows the real cover once cover_image_url is set */}
                <div className={styles.cover}>
                  {issue.cover_image_url && (
                    <img src={issue.cover_image_url} alt={`${issue.title} cover`} />
                  )}
                </div>

                <div className={styles.caption}>
                  <h2 className={styles.title}>{issue.title}</h2>
                  <p className={styles.meta}>{issue.semester}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

/** Four plus marks, one on each corner of the parent card. */
function Corners() {
  return (
    <>
      <span aria-hidden className={`${styles.plus} ${styles.tl}`} />
      <span aria-hidden className={`${styles.plus} ${styles.tr}`} />
      <span aria-hidden className={`${styles.plus} ${styles.bl}`} />
      <span aria-hidden className={`${styles.plus} ${styles.br}`} />
    </>
  )
}
