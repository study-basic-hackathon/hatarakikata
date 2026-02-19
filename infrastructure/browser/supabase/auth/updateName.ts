import type { UpdateName } from '@/core/application/service/auth'
import { failAsExternalServiceError,succeed } from '@/core/util/appResult'

import { getSupabaseBrowserClient } from '../client'

export const updateName: UpdateName = async ({ name }) => {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.updateUser({ data: { name } })
  if (error) return failAsExternalServiceError(error.message, error)

  return succeed(undefined)
}
