import { inArray, ne, sql } from 'drizzle-orm'

import type { ListCareerMapsExcludingUserQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerMaps, users } from '../../schema'

export const listCareerMapsExcludingUserQuery: ListCareerMapsExcludingUserQuery = async ({ excludeUserId, limit = 10, offset = 0 }) => {
  try {
    const rows = await db
      .select()
      .from(careerMaps)
      .where(ne(careerMaps.userId, excludeUserId))
      .limit(limit)
      .offset(offset)

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(careerMaps)
      .where(ne(careerMaps.userId, excludeUserId))

    const userIds = [...new Set(rows.map((m) => m.userId))]
    const userNameById = new Map<string, string | null>()

    if (userIds.length > 0) {
      const userRows = await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(inArray(users.id, userIds))

      for (const user of userRows) {
        userNameById.set(user.id, user.name)
      }
    }

    return succeed({
      items: rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        userName: userNameById.get(row.userId) ?? null,
        startDate: row.startDate,
      })),
      count: countResult?.count ?? 0,
      offset,
      limit,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
