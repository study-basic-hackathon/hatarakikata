import { desc, eq } from 'drizzle-orm'

import type { ListCareerGuidesByUserIdQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerGuideRowWithSourceToEntity } from '../../converter'
import { careerGuides } from '../../schema'

export const listCareerGuidesByUserIdQuery: ListCareerGuidesByUserIdQuery = async ({ userId }) => {
  try {
    const rows = await db.query.careerGuides.findMany({
      where: eq(careerGuides.userId, userId),
      orderBy: [desc(careerGuides.createdAt)],
      with: {
        baseCareerMap: {
          columns: { userId: true },
          with: {
            user: {
              columns: { name: true },
            },
          },
        },
      },
    })

    return succeed(rows.map(careerGuideRowWithSourceToEntity))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
