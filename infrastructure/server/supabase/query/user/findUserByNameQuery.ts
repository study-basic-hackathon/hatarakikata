import type { FindUserByNameQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { createSupabaseAdmin } from '../../client'
import { userRowToEntity } from '../../converter'

export const findUserByNameQuery: FindUserByNameQuery = async (name) => {
  try {
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('users')
      .select('id, name')
      .eq('name', name)
      .maybeSingle()

    if (error) return failAsExternalServiceError(error.message, error)
    if (!data) return succeed(null)

    return succeed(userRowToEntity(data))
  } catch (error) {
    return failAsExternalServiceError('Failed to find user by name', error)
  }
}
