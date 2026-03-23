import type { FindCareerEventQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerEventRowToEntity } from '../../converter'

export const findCareerEventQuery: FindCareerEventQuery = async ({ id }) => {
  try {
    const row = await db.query.careerEvents.findFirst({
      where: (careerEvents, { eq }) => eq(careerEvents.id, id),
      with: {
        tagAttachments: {
          with: {
            tag: true,
          },
        },
      },
    })

    if (!row) return succeed(null)

    return succeed(careerEventRowToEntity(row))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
