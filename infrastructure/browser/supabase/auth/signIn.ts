import type { SupabaseClient } from '@supabase/supabase-js'
import type { SignIn } from '@/core/application/service/auth'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'

export function makeSignIn(supabase: SupabaseClient): SignIn {
  return async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) return failAsExternalServiceError(error)

    return succeed({ id: data.user.id, email: data.user.email! })
  }
}
