import { eq, sql } from 'drizzle-orm'

import type { ListCareerEventsByCareerMapIdQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerEventRowToEntity } from '../../converter'
import { careerEvents } from '../../schema'

export const listCareerEventsByCareerMapIdQuery: ListCareerEventsByCareerMapIdQuery = async ({ careerMapId }) => {
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

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(careerEvents)
      .where(eq(careerEvents.careerMapId, careerMapId))

    return succeed({
      items: rows.map(careerEventRowToEntity),
      count: countResult?.count ?? 0,
      offset: 0,
      limit: rows.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
