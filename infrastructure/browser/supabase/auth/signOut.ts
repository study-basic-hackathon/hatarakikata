import type { SupabaseClient } from '@supabase/supabase-js'
import type { SignOut } from '@/core/application/service/auth'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'

export function makeSignOut(supabase: SupabaseClient): SignOut {
  return async () => {
    const { error } = await supabase.auth.signOut()
    if (error) return failAsExternalServiceError(error.message)

    return succeed(undefined)
  }
}
