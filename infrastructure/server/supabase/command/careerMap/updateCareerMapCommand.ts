import type { UpdateCareerMapCommand } from '@/core/application/service/command'
import { failAsExternalServiceError,succeed } from '@/core/util/appResult'

import { createSupabaseServer } from '../../client'
import { careerMapRowToEntity } from '../../converter'

export const updateCareerMapCommand: UpdateCareerMapCommand = async (params) => {
  const supabase = await createSupabaseServer()
  const updateData: Record<string, unknown> = {}
  if (params.userId !== undefined) updateData.user_id = params.userId
  if (params.startDate !== undefined) updateData.start_date = params.startDate

  const { data, error } = await supabase
    .from('career_maps')
    .update(updateData)
    .eq('id', params.id)
    .select('id, user_id, start_date')
    .single()

  if (error) return failAsExternalServiceError(error.message, error)

  return succeed(careerMapRowToEntity(data))
}
