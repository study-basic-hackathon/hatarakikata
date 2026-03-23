import { inArray } from 'drizzle-orm'

import type { FindCareerMapEventTagsByIdsQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerMapEventTags } from '../../schema'

export const findCareerMapEventTagsByIdsQuery: FindCareerMapEventTagsByIdsQuery = async (ids) => {
  if (ids.length === 0) return succeed([])

  try {
    const rows = await db
      .select({ id: careerMapEventTags.id, name: careerMapEventTags.name })
      .from(careerMapEventTags)
      .where(inArray(careerMapEventTags.id, ids))

    return succeed(rows.map((row) => ({ id: row.id, name: row.name })))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
