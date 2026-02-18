import type { SupabaseClient } from '@supabase/supabase-js'
import type { ResetPassword } from '@/core/application/service/auth'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'

export function makeResetPassword(supabase: SupabaseClient): ResetPassword {
  return async ({ email }) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) return failAsExternalServiceError(error.message)

    return succeed(undefined)
  }
}
