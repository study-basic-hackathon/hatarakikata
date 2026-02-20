import type { ListUserNamesQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { createSupabaseAdmin } from '../../client'

export const listUserNamesQuery: ListUserNamesQuery = async () => {
  try {
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('users')
      .select('name')

    if (error) return failAsExternalServiceError(error.message, error)

    const names = (data ?? []).map((row) => row.name).filter((name): name is string => name !== null)
    return succeed({ names })
  } catch (error) {
    return failAsExternalServiceError('Failed to list user names', error)
  }
}
