import type { SupabaseClient } from '@supabase/supabase-js'
import type { UpdatePassword } from '@/core/application/service/auth'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'

export function makeUpdatePassword(supabase: SupabaseClient): UpdatePassword {
  return async ({ password }) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return failAsExternalServiceError(error.message)

    return succeed(undefined)
  }
}
