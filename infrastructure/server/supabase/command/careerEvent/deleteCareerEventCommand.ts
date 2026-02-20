import type { DeleteCareerEventCommand } from '@/core/application/port/command'
import { failAsExternalServiceError,succeed } from '@/core/util/appResult'

import { createSupabaseAdmin } from '../../client'

export const deleteCareerEventCommand: DeleteCareerEventCommand = async ({ id }) => {
  const supabase = createSupabaseAdmin()
  const { error } = await supabase
    .from('career_events')
    .delete()
    .eq('id', id)

  if (error) return failAsExternalServiceError(error.message, error)

  return succeed(undefined)
}
