import type { ListAllCareerMapIdsQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerMaps } from '../../schema'

export const listAllCareerMapIdsQuery: ListAllCareerMapIdsQuery = async () => {
  try {
    const rows = await db.select({ id: careerMaps.id }).from(careerMaps)
    return succeed(rows.map((row) => row.id))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
