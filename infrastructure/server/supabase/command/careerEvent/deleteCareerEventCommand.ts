import type { DeleteCareerEventCommand } from '@/core/application/service/command'
import { failAsExternalServiceError,succeed } from '@/core/util/appResult'

import { createSupabaseServer } from '../../client'

export const deleteCareerEventCommand: DeleteCareerEventCommand = async ({ id }) => {
  const supabase = await createSupabaseServer()
  const { error } = await supabase
    .from('career_events')
    .delete()
    .eq('id', id)

  if (error) return failAsExternalServiceError(error.message, error)

  return succeed(undefined)
}
