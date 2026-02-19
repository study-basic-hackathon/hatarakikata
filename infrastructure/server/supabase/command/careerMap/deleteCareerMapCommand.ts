import type { DeleteCareerMapCommand } from '@/core/application/service/command'
import { failAsExternalServiceError,succeed } from '@/core/util/appResult'

import { createSupabaseServer } from '../../client'
import { careerMapRowToEntity } from '../../converter'

export const deleteCareerMapCommand: DeleteCareerMapCommand = async ({ id }) => {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from('career_maps')
    .delete()
    .eq('id', id)
    .select('id, user_id, start_date')
    .single()

  if (error) return failAsExternalServiceError(error.message, error)

  return succeed(careerMapRowToEntity(data))
}
