import { asc, sql } from 'drizzle-orm'

import type { ListCareerMapEventTagsQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerMapEventTagRowToEntity } from '../../converter'
import { careerMapEventTags } from '../../schema'

export const listCareerMapEventTagsQuery: ListCareerMapEventTagsQuery = async () => {
  try {
    const rows = await db
      .select()
      .from(careerMapEventTags)
      .orderBy(asc(careerMapEventTags.name))

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(careerMapEventTags)

    return succeed({
      items: rows.map(careerMapEventTagRowToEntity),
      count: countResult?.count ?? 0,
      offset: 0,
      limit: rows.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
