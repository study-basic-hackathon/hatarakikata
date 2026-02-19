import type { SignUp } from '@/core/application/service/auth'
import { failAsExternalServiceError,succeed } from '@/core/util/appResult'

import { getSupabaseBrowserClient } from '../client'

export const signUp: SignUp = async ({ email, password }) => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) return failAsExternalServiceError(error.message, error)
  if (!data.user) return failAsExternalServiceError('User creation failed')

  return succeed({ id: data.user.id, email: data.user.email! })
}
