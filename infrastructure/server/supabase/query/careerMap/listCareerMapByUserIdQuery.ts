import type { ListCareerMapByUserIdQuery } from '@/core/application/port/query'
import { failAsExternalServiceError,succeed } from '@/core/util/appResult'

import { createSupabaseServer } from '../../client'
import { careerMapRowToEntity } from '../../converter'

export const listCareerMapByUserIdQuery: ListCareerMapByUserIdQuery = async ({ userId }) => {
  const supabase = await createSupabaseServer()
  const { data, error, count } = await supabase
    .from('career_maps')
    .select('id, user_id, start_date', { count: 'exact' })
    .eq('user_id', userId)

  if (error) return failAsExternalServiceError(error.message, error)

  return succeed({
    items: (data ?? []).map(careerMapRowToEntity),
    count: count ?? 0,
    offset: 0,
    limit: (data ?? []).length,
  })
}
