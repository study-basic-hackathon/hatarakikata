import type { SupabaseClient } from '@supabase/supabase-js'
import type { UpdateCareerMapCommand } from '@/core/application/service/command'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'
import { careerMapRowToEntity } from '@/infrastructure/converter'

export function makeUpdateCareerMapCommand(supabase: SupabaseClient): UpdateCareerMapCommand {
  return async (params) => {
    const updateData: Record<string, unknown> = {}
    if (params.userId !== undefined) updateData.user_id = params.userId
    if (params.startDate !== undefined) updateData.start_date = params.startDate

    const { data, error } = await supabase
      .from('career_maps')
      .update(updateData)
      .eq('id', params.id)
      .select('id, user_id, start_date')
      .single()

    if (error) return failAsExternalServiceError(error.message)

    return succeed(careerMapRowToEntity(data))
  }
}
