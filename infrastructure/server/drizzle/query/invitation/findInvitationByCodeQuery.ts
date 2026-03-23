import { eq } from 'drizzle-orm'

import type { FindInvitationByCodeQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { invitationCodes } from '../../schema'

export const findInvitationByCodeQuery: FindInvitationByCodeQuery = async ({ code }) => {
  try {
    const rows = await db
      .select({ id: invitationCodes.id, code: invitationCodes.code, usedAt: invitationCodes.usedAt })
      .from(invitationCodes)
      .where(eq(invitationCodes.code, code))
      .limit(1)

    if (!rows[0]) return succeed(null)

    return succeed({
      id: rows[0].id,
      code: rows[0].code,
      usedAt: rows[0].usedAt?.toISOString() ?? null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
