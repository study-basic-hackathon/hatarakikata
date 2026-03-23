import type { UpdateMembershipCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { memberships } from '../../schema'

export const updateMembershipCommand: UpdateMembershipCommand = async ({ userId, plan }) => {
  try {
    await db.insert(memberships).values({ userId, plan }).onConflictDoUpdate({
      target: memberships.userId,
      set: { plan },
    })

    return succeed(undefined)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
