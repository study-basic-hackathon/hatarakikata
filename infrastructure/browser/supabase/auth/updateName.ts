import type { SupabaseClient } from '@supabase/supabase-js'
import type { UpdateName } from '@/core/application/service/auth'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'

export function makeUpdateName(supabase: SupabaseClient): UpdateName {
  return async ({ name }) => {
    const { error } = await supabase.auth.updateUser({ data: { name } })
    if (error) return failAsExternalServiceError(error.message)

    return succeed(undefined)
  }
}
