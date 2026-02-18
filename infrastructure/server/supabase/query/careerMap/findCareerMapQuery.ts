import type { SupabaseClient } from '@supabase/supabase-js'
import type { FindCareerMapQuery } from '@/core/application/service/query'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'
import { careerMapRowToEntity } from '@/infrastructure/converter'

export function makeFindCareerMapQuery(supabase: SupabaseClient): FindCareerMapQuery {
  return async ({ id }) => {
    const { data, error } = await supabase
      .from('career_maps')
      .select('id, user_id, start_date')
      .eq('id', id)
      .maybeSingle()

    if (error) return failAsExternalServiceError(error.message)
    if (!data) return succeed(null)

    return succeed(careerMapRowToEntity(data))
  }
}
