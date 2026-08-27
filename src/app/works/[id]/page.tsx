import { supabase } from '@/lib/supabase'
import type { Work } from '@/types'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

import ProseViewer from '@/components/ProseViewer'
import PoetryViewer from '@/components/PoetryViewer'
import VisualArtViewer from '@/components/VisualArtViewer'
import AudioViewer from '@/components/AudioViewer'
import FilmViewer from '@/components/FilmViewer'
import GameViewer from '@/components/GameViewer'
import WorkView from '@/components/WorkView'
import { toFrameData } from '@/custom-pages/frame-data'
import { hasCustomPage, customPageDefaultView, customPagePath } from '@/custom-pages/registry'

async function getWork(id: string): Promise<Work | null> {
  const { data, error } = await supabase
    .from('works')
    .select(`
      *,
      author:authors(*),
      issue:issues(*),
      work_images(*),
      work_audio_files(*)
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Work
}

/** The existing per-media-type default view. Unchanged behaviour. */
function DefaultViewer({ work }: { work: Work }) {
  switch (work.media_type) {
    case 'prose':
      return <ProseViewer work={work} />
    case 'poetry':
      return <PoetryViewer work={work} />
    case 'visual-art':
      return <VisualArtViewer work={work} />
    case 'audio':
      return <AudioViewer work={work} />
    case 'film':
      return <FilmViewer work={work} />
    case 'game':
      return <GameViewer work={work} />
    default:
      return <ProseViewer work={work} />
  }
}

export default async function WorkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ view?: string }>
}) {
  const { id } = await params
  const { view } = await searchParams
  const work = await getWork(id)

  if (!work) return notFound()

  const hasCustom = hasCustomPage(work.id)

  // ?view=custom / ?view=default overrides the registry default (handy for
  // sharing a specific view). Falls back to the registry preference.
  const initialView: 'default' | 'custom' =
    view === 'custom' || view === 'default'
      ? view
      : customPageDefaultView(work.id)

  return (
    <WorkView
      hasCustom={hasCustom}
      initialView={initialView}
      customSrc={customPagePath(work.id)}
      frameData={toFrameData(work)}
      defaultSlot={<DefaultViewer work={work} />}
    />
  )
}
