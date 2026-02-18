import type { SupabaseClient } from '@supabase/supabase-js'
import type { UpdateCareerEventCommand } from '@/core/application/service/command'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'
import { careerEventRowToEntity } from '@/infrastructure/converter'
import type { CareerEventWithTagsRow } from '@/infrastructure/types'

const CAREER_EVENT_SELECT_WITH_TAGS = 'id, career_map_id, name, start_date, end_date, strength, row, description, career_map_event_tag_attachments(career_map_event_tags(id, name))'

export function makeUpdateCareerEventCommand(supabase: SupabaseClient): UpdateCareerEventCommand {
  return async (params) => {
    const updateData: Record<string, unknown> = {}
    if (params.careerMapId !== undefined) updateData.career_map_id = params.careerMapId
    if (params.name !== undefined) updateData.name = params.name
    if (params.startDate !== undefined) updateData.start_date = params.startDate
    if (params.endDate !== undefined) updateData.end_date = params.endDate
    if (params.strength !== undefined) updateData.strength = params.strength
    if (params.row !== undefined) updateData.row = params.row
    if (params.description !== undefined) updateData.description = params.description

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('career_events')
        .update(updateData)
        .eq('id', params.id)

      if (error) return failAsExternalServiceError(error.message)
    }

    if (params.tags !== undefined) {
      const { error: deleteError } = await supabase
        .from('career_map_event_tag_attachments')
        .delete()
        .eq('career_event_id', params.id)

      if (deleteError) return failAsExternalServiceError(deleteError.message)

      if (params.tags.length > 0) {
        const attachments = params.tags.map((tagId) => ({
          career_event_id: params.id,
          career_map_event_tag_id: tagId,
        }))

        const { error: insertError } = await supabase
          .from('career_map_event_tag_attachments')
          .insert(attachments)

        if (insertError) return failAsExternalServiceError(insertError.message)
      }
    }

    const { data: fullData, error: fetchError } = await supabase
      .from('career_events')
      .select(CAREER_EVENT_SELECT_WITH_TAGS)
      .eq('id', params.id)
      .single()

    if (fetchError) return failAsExternalServiceError(fetchError.message)

    return succeed(careerEventRowToEntity(fullData as unknown as CareerEventWithTagsRow))
  }
}
