import type { DeleteAuthUserByEmailCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'
import { createSupabaseAdmin } from '@/infrastructure/server/supabase/client'

export const deleteAuthUserByEmailCommand: DeleteAuthUserByEmailCommand = async (parameters) => {
  try {
    const supabase = createSupabaseAdmin()

    const { data, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) return failAsExternalServiceError(listError.message, listError)

    const authUser = data.users.find((u: { email?: string }) => u.email === parameters.email)
    if (!authUser) return succeed(undefined)

    const { error } = await supabase.auth.admin.deleteUser(authUser.id)
    if (error) return failAsExternalServiceError(error.message, error)

    return succeed(undefined)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
