import type { CreateCareerMapCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { createSupabaseAdmin } from '../../client'
import { careerMapRowToEntity } from '../../converter'

export const createCareerMapCommand: CreateCareerMapCommand = async ({ userId, startDate }) => {
  try {
    const supabase = createSupabaseAdmin()
    const insertData: Record<string, unknown> = { user_id: userId }
    if (startDate !== undefined && startDate !== null) insertData.start_date = startDate

    const { data, error } = await supabase
      .from('career_maps')
      .insert(insertData)
      .select('id, user_id, start_date')
      .single()

    if (error) return failAsExternalServiceError(error.message, error)

    return succeed(careerMapRowToEntity(data))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
