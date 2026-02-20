import type { DeleteUserCommand } from '@/core/application/port/command'
import { failAsExternalServiceError,succeed } from '@/core/util/appResult'

import { createSupabaseAdmin } from '../../client'
import { userRowToEntity } from '../../converter'

export const deleteUserCommand: DeleteUserCommand = async ({ id }) => {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .select('id, name')
    .single()

  if (error) return failAsExternalServiceError(error.message, error)

  return succeed(userRowToEntity(data))
}
