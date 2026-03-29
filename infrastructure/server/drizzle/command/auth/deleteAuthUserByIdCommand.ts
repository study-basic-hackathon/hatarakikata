import type { DeleteAuthUserByIdCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'
import { createSupabaseAdmin } from '@/infrastructure/server/supabase/client'

export const deleteAuthUserByIdCommand: DeleteAuthUserByIdCommand = async (parameters) => {
  try {
    const supabase = createSupabaseAdmin()

    const { error } = await supabase.auth.admin.deleteUser(parameters.id)
    if (error) return failAsExternalServiceError(error.message, error)

    return succeed(undefined)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
