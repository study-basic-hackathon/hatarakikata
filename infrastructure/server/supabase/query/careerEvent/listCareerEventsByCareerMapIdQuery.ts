import type { SupabaseClient } from '@supabase/supabase-js'
import type { ListCareerEventsByCareerMapIdQuery } from '@/core/application/service/query'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'
import { careerEventRowToEntity } from '@/infrastructure/converter'
import type { CareerEventWithTagsRow } from '@/infrastructure/types'

export function makeListCareerEventsByCareerMapIdQuery(supabase: SupabaseClient): ListCareerEventsByCareerMapIdQuery {
  return async ({ careerMapId }) => {
    const { data, error, count } = await supabase
      .from('career_events')
      .select('id, career_map_id, name, start_date, end_date, strength, row, description, career_map_event_tag_attachments(career_map_event_tags(id, name))', { count: 'exact' })
      .eq('career_map_id', careerMapId)

    if (error) return failAsExternalServiceError(error.message)

    return succeed({
      items: (data ?? []).map((row) => careerEventRowToEntity(row as unknown as CareerEventWithTagsRow)),
      count: count ?? 0,
      offset: 0,
      limit: (data ?? []).length,
    })
  }
}
