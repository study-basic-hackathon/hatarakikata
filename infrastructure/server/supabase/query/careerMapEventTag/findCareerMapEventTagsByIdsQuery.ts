import type { FindCareerMapEventTagsByIdsQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { createSupabaseAdmin } from '../../client'

export const findCareerMapEventTagsByIdsQuery: FindCareerMapEventTagsByIdsQuery = async (ids) => {
  if (ids.length === 0) return succeed([])

  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('career_map_event_tags')
    .select('id, name')
    .in('id', ids)

  if (error) return failAsExternalServiceError(error.message, error)

  return succeed((data ?? []).map((row) => ({ id: row.id, name: row.name })))
}
