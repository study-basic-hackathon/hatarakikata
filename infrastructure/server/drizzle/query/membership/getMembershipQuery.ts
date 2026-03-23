import { eq } from 'drizzle-orm'

import type { GetMembershipQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { memberships } from '../../schema'

export const getMembershipQuery: GetMembershipQuery = async ({ userId }) => {
  try {
    const rows = await db
      .select()
      .from(memberships)
      .where(eq(memberships.userId, userId))
      .limit(1)

    if (!rows[0]) return succeed({ userId, plan: 'free' as const })

    return succeed({ userId: rows[0].userId, plan: rows[0].plan as 'free' | 'premium' })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
