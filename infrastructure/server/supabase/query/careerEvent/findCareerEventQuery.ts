import type { SupabaseClient } from '@supabase/supabase-js'
import type { FindCareerEventQuery } from '@/core/application/service/query'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'
import { careerEventRowToEntity } from '@/infrastructure/converter'
import type { CareerEventWithTagsRow } from '@/infrastructure/types'

export function makeFindCareerEventQuery(supabase: SupabaseClient): FindCareerEventQuery {
  return async ({ id }) => {
    const { data, error } = await supabase
      .from('career_events')
      .select('id, career_map_id, name, start_date, end_date, type, strength, row, description, career_map_event_tag_attachments(career_map_event_tags(id, name))')
      .eq('id', id)
      .maybeSingle()

    if (error) return failAsExternalServiceError(error.message)
    if (!data) return succeed(null)

    return succeed(careerEventRowToEntity(data as unknown as CareerEventWithTagsRow))
  }
}
