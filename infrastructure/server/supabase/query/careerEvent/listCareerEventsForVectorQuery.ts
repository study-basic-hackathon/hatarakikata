import type { SupabaseClient } from '@supabase/supabase-js'

import type { CareerEvent } from '@/core/domain/entity/careerEvent'

import { careerEventRowToEntity } from '../../converter'
import type { CareerEventWithTagsRow } from '../../schemas'

export async function listCareerEventsForVectorQuery(
  supabase: SupabaseClient,
  careerMapId: string
): Promise<CareerEvent[]> {
  const { data, error } = await supabase
    .from('career_events')
    .select('id, career_map_id, name, type, start_date, end_date, strength, row, description, career_map_event_tag_attachments(career_map_event_tags(id, name))')
    .eq('career_map_id', careerMapId)

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => careerEventRowToEntity(row as unknown as CareerEventWithTagsRow))
}
