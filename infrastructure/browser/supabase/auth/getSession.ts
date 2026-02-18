import type { SupabaseClient } from '@supabase/supabase-js'
import type { GetSession } from '@/core/application/service/auth'
import { succeed } from '@/core/util/appResult'

export function makeGetSession(supabase: SupabaseClient): GetSession {
  return async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return succeed(null)

    return succeed({ id: data.user.id, email: data.user.email! })
  }
}
