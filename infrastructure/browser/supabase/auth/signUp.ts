import type { SupabaseClient } from '@supabase/supabase-js'
import type { SignUp } from '@/core/application/service/auth'
import { succeed, failAsExternalServiceError } from '@/core/util/appResult'

export function makeSignUp(supabase: SupabaseClient): SignUp {
  return async ({ email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) return failAsExternalServiceError(error.message)
    if (!data.user) return failAsExternalServiceError('User creation failed')

    return succeed({ id: data.user.id, email: data.user.email! })
  }
}
