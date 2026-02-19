import type { ResetPassword } from '@/core/application/service/auth'
import { failAsExternalServiceError,succeed } from '@/core/util/appResult'

import { getSupabaseBrowserClient } from '../client'

export const resetPassword: ResetPassword = async ({ email }) => {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) return failAsExternalServiceError(error.message, error)

  return succeed(undefined)
}
