import { eq } from 'drizzle-orm'

import type { UpdateInvitationCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { invitationCodes } from '../../schema'

export const updateInvitationCommand: UpdateInvitationCommand = async ({ invitationId }) => {
  try {
    await db.update(invitationCodes).set({ usedAt: new Date() }).where(eq(invitationCodes.id, invitationId))

    return succeed(undefined)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
