import type { UpdateEmail } from '@/core/application/port/auth'
import { failAsExternalServiceError,succeed } from '@/core/util/appResult'

import { getSupabaseBrowserClient } from '../client'

export const updateEmail: UpdateEmail = async ({ email }) => {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/api/auth/confirm` },
  )
  if (error) return failAsExternalServiceError(error.message, error)

  return succeed(undefined)
}
