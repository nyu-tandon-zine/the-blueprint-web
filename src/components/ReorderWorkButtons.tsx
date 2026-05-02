'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

interface Props {
  workId: string
  position: number
  prevPosition: number | null  // position of the work above, null if first
  nextPosition: number | null  // position of the work below, null if last
  prevId: string | null
  nextId: string | null
}

export default function ReorderWorkButtons({
  workId,
  position,
  prevPosition,
  nextPosition,
  prevId,
  nextId,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function swap(otherId: string, otherPosition: number) {
    // Temp position to avoid unique constraint
    const tempPos = position + 99999

    const { error: e1 } = await supabase.from('works').update({ position: tempPos }).eq('id', workId)
    if (e1) { alert(e1.message); return }

    const { error: e2 } = await supabase.from('works').update({ position: position }).eq('id', otherId)
    if (e2) { alert(e2.message); return }

    const { error: e3 } = await supabase.from('works').update({ position: otherPosition }).eq('id', workId)
    if (e3) { alert(e3.message); return }

    router.refresh()
  }

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    background: 'none',
    border: 'none',
    cursor: disabled ? 'default' : 'pointer',
    color: disabled ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.4)',
    fontSize: 10,
    padding: '1px 3px',
    lineHeight: 1,
    fontFamily: 'sans-serif',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <button
        style={btnStyle(prevId === null)}
        disabled={prevId === null}
        onClick={() => prevId && prevPosition !== null && swap(prevId, prevPosition)}
        title="Move up"
      >▲</button>
      <button
        style={btnStyle(nextId === null)}
        disabled={nextId === null}
        onClick={() => nextId && nextPosition !== null && swap(nextId, nextPosition)}
        title="Move down"
      >▼</button>
    </div>
  )
}
