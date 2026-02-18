import type { SupabaseClient } from '@supabase/supabase-js'
import type { DeleteCareerMapCommand } from '@/core/application/service/command'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'
import { careerMapRowToEntity } from '@/infrastructure/converter'

export function makeDeleteCareerMapCommand(supabase: SupabaseClient): DeleteCareerMapCommand {
  return async ({ id }) => {
    const { data, error } = await supabase
      .from('career_maps')
      .delete()
      .eq('id', id)
      .select('id, user_id, start_date')
      .single()

    if (error) return failAsExternalServiceError(error.message)

    return succeed(careerMapRowToEntity(data))
  }
}
