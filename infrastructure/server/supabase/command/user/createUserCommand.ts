import type { CreateUserCommand } from '@/core/application/service/command'
import { failAsExternalServiceError,succeed } from '@/core/util/appResult'

import { createSupabaseServer } from '../../client'
import { userRowToEntity } from '../../converter'

export const createUserCommand: CreateUserCommand = async ({ id, name }) => {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from('users')
    .insert({ id, name })
    .select('id, name')
    .single()

  if (error) return failAsExternalServiceError(error.message, error)

  return succeed(userRowToEntity(data))
}
