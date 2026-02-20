import type { UpdateUserCommand } from '@/core/application/port/command'
import { failAsExternalServiceError,succeed } from '@/core/util/appResult'

import { createSupabaseAdmin } from '../../client'
import { userRowToEntity } from '../../converter'

export const updateUserCommand: UpdateUserCommand = async ({ id, ...rest }) => {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('users')
    .update(rest)
    .eq('id', id)
    .select('id, name')
    .single()

  if (error) return failAsExternalServiceError(error.message, error)

  return succeed(userRowToEntity(data))
}
