import type { SupabaseClient } from '@supabase/supabase-js'
import type { ListCareerMapByUserIdQuery } from '@/core/application/service/query'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'
import { careerMapRowToEntity } from '@/infrastructure/converter'

export function makeListCareerMapByUserIdQuery(supabase: SupabaseClient): ListCareerMapByUserIdQuery {
  return async ({ userId }) => {
    const { data, error, count } = await supabase
      .from('career_maps')
      .select('id, user_id, start_date', { count: 'exact' })
      .eq('user_id', userId)

    if (error) return failAsExternalServiceError(error.message)

    return succeed({
      items: (data ?? []).map(careerMapRowToEntity),
      count: count ?? 0,
      offset: 0,
      limit: (data ?? []).length,
    })
  }
}
