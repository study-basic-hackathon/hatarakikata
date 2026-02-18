import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateCareerEventCommand } from '@/core/application/service/command'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'
import { careerEventRowToEntity } from '@/infrastructure/converter'
import type { CareerEventWithTagsRow } from '@/infrastructure/types'

const CAREER_EVENT_SELECT_WITH_TAGS = 'id, career_map_id, name, start_date, end_date, strength, row, description, career_map_event_tag_attachments(career_map_event_tags(id, name))'

export function makeCreateCareerEventCommand(supabase: SupabaseClient): CreateCareerEventCommand {
  return async (params) => {
    const { data, error } = await supabase
      .from('career_events')
      .insert({
        career_map_id: params.careerMapId,
        name: params.name,
        start_date: params.startDate,
        end_date: params.endDate,
        strength: params.strength,
        row: params.row ?? 0,
        description: params.description ?? null,
      })
      .select('id')
      .single()

    if (error) return failAsExternalServiceError(error.message)

    if (params.tags && params.tags.length > 0) {
      const attachments = params.tags.map((tagId) => ({
        career_event_id: data.id,
        career_map_event_tag_id: tagId,
      }))

      const { error: attachError } = await supabase
        .from('career_map_event_tag_attachments')
        .insert(attachments)

      if (attachError) return failAsExternalServiceError(attachError.message)
    }

    const { data: fullData, error: fetchError } = await supabase
      .from('career_events')
      .select(CAREER_EVENT_SELECT_WITH_TAGS)
      .eq('id', data.id)
      .single()

    if (fetchError) return failAsExternalServiceError(fetchError.message)

    return succeed(careerEventRowToEntity(fullData as unknown as CareerEventWithTagsRow))
  }
}
