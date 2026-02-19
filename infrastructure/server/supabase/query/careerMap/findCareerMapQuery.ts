import type { FindCareerMapQuery } from '@/core/application/service/query'
import { failAsExternalServiceError,succeed } from '@/core/util/appResult'

import { createSupabaseServer } from '../../client'
import { careerMapRowToEntity } from '../../converter'

export const findCareerMapQuery: FindCareerMapQuery = async ({ id }) => {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from('career_maps')
    .select('id, user_id, start_date')
    .eq('id', id)
    .maybeSingle()

  if (error) return failAsExternalServiceError(error.message, error)
  if (!data) return succeed(null)

  return succeed(careerMapRowToEntity(data))
}
