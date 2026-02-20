import type { CreateUserCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { createSupabaseAdmin } from '../../client'
import { userRowToEntity } from '../../converter'

export const createUserCommand: CreateUserCommand = async ({ id, name }) => {
  try {
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('users')
      .insert({ id, name })
      .select('id, name')
      .single()

    if (error) return failAsExternalServiceError(error.message, error)

    return succeed(userRowToEntity(data))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
