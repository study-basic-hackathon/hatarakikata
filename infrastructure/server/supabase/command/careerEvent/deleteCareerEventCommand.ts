import type { SupabaseClient } from '@supabase/supabase-js'
import type { DeleteCareerEventCommand } from '@/core/application/service/command'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'
import { careerEventRowToEntity } from '@/infrastructure/converter'
import type { CareerEventWithTagsRow } from '@/infrastructure/types'

const CAREER_EVENT_SELECT_WITH_TAGS = 'id, career_map_id, name, start_date, end_date, type, strength, row, description, career_map_event_tag_attachments(career_map_event_tags(id, name))'

export function makeDeleteCareerEventCommand(supabase: SupabaseClient): DeleteCareerEventCommand {
  return async ({ id }) => {
    const { data: existing, error: fetchError } = await supabase
      .from('career_events')
      .select(CAREER_EVENT_SELECT_WITH_TAGS)
      .eq('id', id)
      .single()

    if (fetchError) return failAsExternalServiceError(fetchError.message)

    const { error } = await supabase
      .from('career_events')
      .delete()
      .eq('id', id)

    if (error) return failAsExternalServiceError(error.message)

    return succeed(careerEventRowToEntity(existing as unknown as CareerEventWithTagsRow))
  }
}
