import type { FindCareerGuideQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerGuideRowToEntity } from '../../converter'

export const findCareerGuideQuery: FindCareerGuideQuery = async ({ id }) => {
  try {
    const row = await db.query.careerGuides.findFirst({
      where: (careerGuides, { eq }) => eq(careerGuides.id, id),
    })

    if (!row) return succeed(null)

    return succeed(careerGuideRowToEntity(row))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
