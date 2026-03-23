import type { ListCareerEventsForVectorQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerEventRowToEntity } from '../../converter'

export const listCareerEventsForVectorQuery: ListCareerEventsForVectorQuery = async (careerMapId) => {
  try {
    const rows = await db.query.careerEvents.findMany({
      where: (careerEvents, { eq }) => eq(careerEvents.careerMapId, careerMapId),
      with: {
        tagAttachments: {
          with: {
            tag: true,
          },
        },
      },
    })

    return succeed(rows.map(careerEventRowToEntity))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
