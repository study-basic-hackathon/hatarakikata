import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateCareerMapCommand } from '@/core/application/service/command'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'
import { careerMapRowToEntity } from '@/infrastructure/converter'

export function makeCreateCareerMapCommand(supabase: SupabaseClient): CreateCareerMapCommand {
  return async ({ userId, startDate }) => {
    const insertData: Record<string, unknown> = { user_id: userId }
    if (startDate !== undefined && startDate !== null) insertData.start_date = startDate

    const { data, error } = await supabase
      .from('career_maps')
      .insert(insertData)
      .select('id, user_id, start_date')
      .single()

    if (error) return failAsExternalServiceError(error.message)

    return succeed(careerMapRowToEntity(data))
  }
}
