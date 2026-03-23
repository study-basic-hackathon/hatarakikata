import { eq, sql } from 'drizzle-orm'

import type { ListCareerMapByUserIdQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerMapRowToEntity } from '../../converter'
import { careerMaps } from '../../schema'

export const listCareerMapByUserIdQuery: ListCareerMapByUserIdQuery = async ({ userId }) => {
  try {
    const rows = await db.select().from(careerMaps).where(eq(careerMaps.userId, userId))

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(careerMaps)
      .where(eq(careerMaps.userId, userId))

    return succeed({
      items: rows.map(careerMapRowToEntity),
      count: countResult?.count ?? 0,
      offset: 0,
      limit: rows.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
