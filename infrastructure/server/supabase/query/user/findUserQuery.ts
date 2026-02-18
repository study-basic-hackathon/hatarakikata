import type { SupabaseClient } from '@supabase/supabase-js'
import type { FindUserQuery } from '@/core/application/service/query'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'
import { userRowToEntity } from '@/infrastructure/converter'

export function makeFindUserQuery(supabase: SupabaseClient): FindUserQuery {
  return async ({ id }) => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', id)
      .maybeSingle()

    if (error) return failAsExternalServiceError(error.message)
    if (!data) return succeed(null)

    return succeed(userRowToEntity(data))
  }
}
