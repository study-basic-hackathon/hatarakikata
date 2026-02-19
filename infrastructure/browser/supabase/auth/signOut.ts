import type { SignOut } from '@/core/application/service/auth'
import { failAsExternalServiceError,succeed } from '@/core/util/appResult'

import { getSupabaseBrowserClient } from '../client'

export const signOut: SignOut = async () => {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.signOut()
  if (error) return failAsExternalServiceError(error.message, error)

  return succeed(undefined)
}
