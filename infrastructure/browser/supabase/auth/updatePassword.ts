import type { UpdatePassword } from '@/core/application/port/auth'
import { failAsExternalServiceError,succeed } from '@/core/util/appResult'

import { getSupabaseBrowserClient } from '../client'

export const updatePassword: UpdatePassword = async ({ password }) => {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return failAsExternalServiceError(error.message, error)

  return succeed(undefined)
}
