import type { SignIn } from '@/core/application/service/auth'
import { failAsExternalServiceError,succeed } from '@/core/util/appResult'

import { getSupabaseBrowserClient } from '../client'

export const signIn: SignIn = async ({ email, password }) => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) return failAsExternalServiceError(error.message, error)

  return succeed({ id: data.user.id, email: data.user.email! })
}
