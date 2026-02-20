import type { FindUserQuery } from '@/core/application/port/query'
import { failAsExternalServiceError,succeed } from '@/core/util/appResult'

import { createSupabaseServer } from '../../client'
import { userRowToEntity } from '../../converter'

export const findUserQuery: FindUserQuery = async ({ id }) => {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from('users')
    .select('id, name')
    .eq('id', id)
    .maybeSingle()

  if (error) return failAsExternalServiceError(error.message, error)
  if (!data) return succeed(null)

  return succeed(userRowToEntity(data))
}
