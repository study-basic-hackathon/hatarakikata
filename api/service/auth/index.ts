import type { UserExecutor } from '@/core/application/executor'
import type { User } from '@/core/domain'
import { createSupabaseServer } from '@/infrastructure/server/supabase/client'

export async function getExecutor(): Promise<UserExecutor> {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase.auth.getUser()

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
