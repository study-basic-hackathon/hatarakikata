import type { CreateMembershipCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { memberships } from '../../schema'

export const createMembershipCommand: CreateMembershipCommand = async (parameters) => {
  try {
    await db.insert(memberships).values({
      userId: parameters.userId,
      plan: parameters.plan,
    }).onConflictDoUpdate({
      target: memberships.userId,
      set: { plan: parameters.plan },
    })

    return succeed(undefined)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
