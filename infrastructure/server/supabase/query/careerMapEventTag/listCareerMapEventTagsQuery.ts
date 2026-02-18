import type { SupabaseClient } from '@supabase/supabase-js'
import type { ListCareerMapEventTagsQuery } from '@/core/application/service/query'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'
import { careerMapEventTagRowToEntity } from '@/infrastructure/converter'

export function makeListCareerMapEventTagsQuery(supabase: SupabaseClient): ListCareerMapEventTagsQuery {
  return async () => {
    const { data, error, count } = await supabase
      .from('career_map_event_tags')
      .select('id, name', { count: 'exact' })
      .order('name')

    if (error) return failAsExternalServiceError(error.message)

    return succeed({
      items: (data ?? []).map(careerMapEventTagRowToEntity),
      count: count ?? 0,
      offset: 0,
      limit: (data ?? []).length,
    })
  }
}
