import type { SupabaseClient } from '@supabase/supabase-js'
import type { DeleteUserCommand } from '@/core/application/service/command'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'
import { userRowToEntity } from '@/infrastructure/converter'

export function makeDeleteUserCommand(supabase: SupabaseClient): DeleteUserCommand {
  return async ({ id }) => {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select('id, name')
      .single()

    if (error) return failAsExternalServiceError(error.message)

    return succeed(userRowToEntity(data))
  }
}
