import type { SupabaseClient } from '@supabase/supabase-js'
import type { UpdateEmail } from '@/core/application/service/auth'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'

export function makeUpdateEmail(supabase: SupabaseClient): UpdateEmail {
  return async ({ email }) => {
    const { error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: `${window.location.origin}/api/auth/confirm` },
    )
    if (error) return failAsExternalServiceError(error.message)

    return succeed(undefined)
  }
}
