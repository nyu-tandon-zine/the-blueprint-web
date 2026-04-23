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

async function getWork(id: string): Promise<Work | null> {
  const { data, error } = await supabase
    .from('works')
    .select(`
      *,
      author:authors(*),
      issue:issues(*),
      work_images(*)
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Work
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const work = await getWork(id)

  if (!work) return notFound()

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
