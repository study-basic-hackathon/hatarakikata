import type { ListCareerMapEventTagsQuery } from '@/core/application/service/query'
import { failAsExternalServiceError,succeed } from '@/core/util/appResult'

import { createSupabaseServer } from '../../client'
import { careerMapEventTagRowToEntity } from '../../converter'

export const listCareerMapEventTagsQuery: ListCareerMapEventTagsQuery = async () => {
  const supabase = await createSupabaseServer()
  const { data, error, count } = await supabase
    .from('career_map_event_tags')
    .select('id, name', { count: 'exact' })
    .order('name')

  if (error) return failAsExternalServiceError(error.message, error)

  return succeed({
    items: (data ?? []).map(careerMapEventTagRowToEntity),
    count: count ?? 0,
    offset: 0,
    limit: (data ?? []).length,
  })
}
