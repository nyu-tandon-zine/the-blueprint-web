import { supabase } from '@/lib/supabase'
import type { Work } from '@/types'
import type { Metadata } from 'next'
import WorkView from '@/components/WorkView'
import { toFrameData, type CustomFrameData } from '@/custom-pages/frame-data'
import { customPagePath } from '@/custom-pages/registry'

export const dynamic = 'force-dynamic'

// A dev/preview tool — keep it out of search results.
export const metadata: Metadata = { robots: { index: false, follow: false } }

async function getWork(id: string): Promise<Work | null> {
  const { data, error } = await supabase
    .from('works')
    .select(`*, author:authors(*), work_images(*), work_audio_files(*)`)
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data as Work
}

// Fallback content so the reference page (/custom-preview/_example) and any
// not-yet-created work still preview with realistic data.
const DEMO_DATA: CustomFrameData = {
  id: '_example',
  title: 'Sample Work Title',
  genre: 'poetry',
  mediaType: 'poetry',
  description: 'A short description or blurb for the work.',
  content:
    'This is where the work’s text would appear.\n\nParagraphs are separated by a blank line, exactly as they are stored in the database.',
  author: { name: 'Sample Author' },
  images: [],
  audio: [],
}

export default async function CustomPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const work = id.startsWith('_') ? null : await getWork(id)
  const frameData = work ? toFrameData(work) : DEMO_DATA

  return (
    <>
      <div
        style={{
          padding: '8px 16px',
          background: '#3a2b0a',
          color: '#ffd479',
          fontFamily: 'sans-serif',
          fontSize: 12,
          letterSpacing: 0.4,
          textAlign: 'center',
        }}
      >
        PREVIEW — this renders <code>public/custom/{id}/index.html</code> in the real shell.
        It is not live until the work ID is added to the registry.
        {work ? '' : ' (Showing sample content — no matching work found.)'}
      </div>
      <WorkView
        hasCustom
        initialView="custom"
        customSrc={customPagePath(id)}
        frameData={frameData}
        defaultSlot={
          <div style={{ padding: 40, color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif' }}>
            Default view of the work would appear here.
          </div>
        }
      />
    </>
  )
}
