import type { GetSession } from '@/core/application/port/auth'
import { succeed } from '@/core/util/appResult'

import { getSupabaseBrowserClient } from '../client'

export const getSession: GetSession = async () => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return succeed(null)

  return succeed({ id: data.user.id, email: data.user.email! })
}
