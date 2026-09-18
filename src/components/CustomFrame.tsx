'use client'

// ----------------------------------------------------------------
// CustomFrame
//
// Renders a custom work page inside a *sandboxed* iframe. This is the
// security boundary for the whole custom-pages system: the page runs
// with `sandbox="allow-scripts"` and NO `allow-same-origin`, which gives
// it an opaque origin. That means a contributor's code cannot read the
// reader's session, touch the rest of the site, or reach any other page.
//
// Two messages cross the boundary, both via postMessage:
//   • parent → frame : the work's content (so the page can show real
//                      title/author/text/images from the database)
//   • frame → parent : the page's height (so the iframe grows to fit
//                      instead of living in a scrollbox)
//
// Never add `allow-same-origin` to the sandbox list below — combined with
// `allow-scripts` it lets the page remove its own sandbox.
// ----------------------------------------------------------------

import { useEffect, useRef, useState } from 'react'
import type { CustomFrameData } from '@/custom-pages/frame-data'

// A few pixels of slack added to the reported height. A page's true rendered
// height is often fractional (e.g. 4000.3px) while the height it reports is a
// rounded whole number — if that rounds *down*, the iframe ends up a sliver
// shorter than its content and grows a 1px internal scrollbar, which makes the
// page feel "stuck" when you scroll. Rounding up and adding this buffer keeps
// the iframe always a hair taller than its content, so no inner scrollbar.
const HEIGHT_BUFFER = 4

export default function CustomFrame({
  src,
  data,
}: {
  src: string
  data: CustomFrameData
}) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(600)

  // Receive height reports from the (isolated) page.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      // The frame has an opaque origin, so we can't check e.origin — we
      // verify the message came from *our* iframe's window instead.
      if (!ref.current || e.source !== ref.current.contentWindow) return
      const msg = e.data
      if (msg && msg.type === 'blueprint:resize' && typeof msg.height === 'number') {
        const next = Math.min(20000, Math.max(200, Math.ceil(msg.height) + HEIGHT_BUFFER))
        // Ignore sub-pixel jitter so we don't thrash React state / the layout.
        setHeight((prev) => (Math.abs(prev - next) <= 1 ? prev : next))
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Send the work content once the frame has loaded.
  function handleLoad() {
    ref.current?.contentWindow?.postMessage({ type: 'blueprint:work', work: data }, '*')
  }

  return (
    <iframe
      ref={ref}
      src={src}
      onLoad={handleLoad}
      title={`Custom page for ${data.title}`}
      sandbox="allow-scripts"
      loading="lazy"
      style={{
        display: 'block',
        width: '100%',
        height,
        border: 'none',
        background: '#0a0a0a',
      }}
    />
  )
}
