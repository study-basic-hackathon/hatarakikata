import type { ListAllCareerMapIdsQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { createSupabaseAdmin } from '../../client'

export const listAllCareerMapIdsQuery: ListAllCareerMapIdsQuery = async () => {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('career_maps')
    .select('id')

  if (error) return failAsExternalServiceError(error.message, error)

  return succeed((data ?? []).map((row) => row.id))
}
