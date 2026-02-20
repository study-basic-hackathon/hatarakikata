import type { ListCareerEventsForVectorQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { createSupabaseAdmin } from '../../client'
import { listCareerEventsForVectorQuery } from './listCareerEventsForVectorQuery'

export const listCareerEventsForVectorAdminQuery: ListCareerEventsForVectorQuery = async (careerMapId) => {
  try {
    const supabase = createSupabaseAdmin()
    const events = await listCareerEventsForVectorQuery(supabase, careerMapId)
    return succeed(events)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
