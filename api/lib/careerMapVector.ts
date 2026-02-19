import type { SupabaseClient } from '@supabase/supabase-js'

type TagAttachmentRow = {
  career_map_event_tags: {
    id: string
    name: string
  }
}

export type CareerEventVectorRow = {
  id: string
  name: string
  start_date: string
  end_date: string
  strength: number
  description: string | null
  career_map_event_tag_attachments: TagAttachmentRow[] | null
}

export type CareerMapVectorData = {
  text: string
  tagWeights: Record<string, number>
}

export async function fetchCareerMapEventsForVector(
  supabase: SupabaseClient,
  careerMapId: string
): Promise<CareerEventVectorRow[]> {
  const { data, error } = await supabase
    .from('career_events')
    .select('id, name, start_date, end_date, strength, description, career_map_event_tag_attachments(career_map_event_tags(id, name))')
    .eq('career_map_id', careerMapId)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as CareerEventVectorRow[]
}

export function buildCareerMapVectorData(events: CareerEventVectorRow[]): CareerMapVectorData {
  const tagWeights: Record<string, number> = {}
  const lines: string[] = []

  for (const event of events) {
    const tagNames: string[] = []
    for (const attachment of event.career_map_event_tag_attachments ?? []) {
      const tag = attachment.career_map_event_tags
      if (!tag) continue
      tagNames.push(tag.name)
      tagWeights[tag.id] = (tagWeights[tag.id] ?? 0) + (event.strength ?? 3)
    }

    const description = event.description ? event.description.replace(/\s+/g, ' ') : ''
    lines.push(
      [
        `Event: ${event.name}`,
        `Date: ${event.start_date} to ${event.end_date}`,
        `Strength: ${event.strength ?? 3}`,
        `Tags: ${tagNames.length ? tagNames.join(', ') : '-'}`,
        `Description: ${description || '-'}`,
      ].join(' | ')
    )
  }

  const text = lines.length ? lines.join('\n') : 'No events'

  return { text, tagWeights }
}
