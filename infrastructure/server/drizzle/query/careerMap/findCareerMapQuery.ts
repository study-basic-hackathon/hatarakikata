import type { FindCareerMapQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerMapRowToEntity } from '../../converter'

export const findCareerMapQuery: FindCareerMapQuery = async ({ id }) => {
  try {
    const row = await db.query.careerMaps.findFirst({
      where: (careerMaps, { eq }) => eq(careerMaps.id, id),
    })

    if (!row) return succeed(null)

    return succeed(careerMapRowToEntity(row))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
