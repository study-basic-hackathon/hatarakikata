import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateUserCommand } from '@/core/application/service/command'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'
import { userRowToEntity } from '@/infrastructure/converter'

export function makeCreateUserCommand(supabase: SupabaseClient): CreateUserCommand {
  return async ({ id, name }) => {
    const { data, error } = await supabase
      .from('users')
      .insert({ id, name })
      .select('id, name')
      .single()

    if (error) return failAsExternalServiceError(error.message)

    return succeed(userRowToEntity(data))
  }
}
