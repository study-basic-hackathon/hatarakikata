import { eq } from 'drizzle-orm'

import type { FindCareerMapVectorQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerMapVectors } from '../../schema'

export const findCareerMapVectorQuery: FindCareerMapVectorQuery = async (careerMapId) => {
  try {
    const rows = await db
      .select()
      .from(careerMapVectors)
      .where(eq(careerMapVectors.careerMapId, careerMapId))
      .limit(1)

    const row = rows[0]
    if (!row) return succeed(null)

    return succeed({
      careerMapId: row.careerMapId,
      embedding: row.embedding,
      tagWeights: (row.tagWeights ?? {}) as Record<string, number>,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
