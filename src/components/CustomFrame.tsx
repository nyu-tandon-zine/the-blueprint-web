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
        // Clamp to something sane so a bug can't blow up the layout.
        setHeight(Math.max(200, Math.min(20000, Math.round(msg.height))))
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
