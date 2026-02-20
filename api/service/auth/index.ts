import { cookies } from 'next/headers'

import type { UserExecutor } from '@/core/application/executor'
import type { User } from '@/core/domain'
import { createSupabaseAdmin } from '@/infrastructure/server/supabase/client'

function getAuthCookieName(): string {
  const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!)
  const projectRef = url.hostname.split('.')[0]
  return `sb-${projectRef}-auth-token`
}

export async function getExecutor(): Promise<UserExecutor> {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(getAuthCookieName())

  if (!authCookie?.value) return guest()

  let accessToken: string
  try {
    const session = JSON.parse(authCookie.value)
    accessToken = session.access_token
  } catch {
    return guest()
  }

  if (!accessToken) return guest()

  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase.auth.getUser(accessToken)

  if (error || !data.user) {
    return guest()
  }

  return general({
    id: data.user.id,
    name: '',
  })
}

function general(user: User): UserExecutor {
  return { type: 'user', userType: 'general', user }
}

function guest(): UserExecutor {
  return { type: 'user', userType: 'guest', user: { id: '', name: '' } }
}
