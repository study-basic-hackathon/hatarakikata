import type { FindUserByNameQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { userRowWithCreditAndMembershipToEntity } from '../../converter'

export const findUserByNameQuery: FindUserByNameQuery = async (name) => {
  try {
    const row = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.name, name),
      with: {
        creditBalance: true,
        membership: true,
      },
    })

    if (!row) return succeed(null)

    return succeed(userRowWithCreditAndMembershipToEntity(row))
  } catch (error) {
    return failAsExternalServiceError('Failed to find user by name', error)
  }
}
