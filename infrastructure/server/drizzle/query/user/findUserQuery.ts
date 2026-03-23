import type { FindUserQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { userRowWithCreditAndMembershipToEntity } from '../../converter'

export const findUserQuery: FindUserQuery = async ({ id }) => {
  try {
    const row = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
      with: {
        creditBalance: true,
        membership: true,
      },
    })

    if (!row) return succeed(null)

    return succeed(userRowWithCreditAndMembershipToEntity(row))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
