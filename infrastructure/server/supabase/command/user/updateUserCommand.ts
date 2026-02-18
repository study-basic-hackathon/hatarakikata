import type { SupabaseClient } from '@supabase/supabase-js'
import type { UpdateUserCommand } from '@/core/application/service/command'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'
import { userRowToEntity } from '@/infrastructure/converter'

export function makeUpdateUserCommand(supabase: SupabaseClient): UpdateUserCommand {
  return async ({ id, ...rest }) => {
    const { data, error } = await supabase
      .from('users')
      .update(rest)
      .eq('id', id)
      .select('id, name')
      .single()

    if (error) return failAsExternalServiceError(error.message)

    return succeed(userRowToEntity(data))
  }
}
