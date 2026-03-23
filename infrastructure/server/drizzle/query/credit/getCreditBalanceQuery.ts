import { eq } from 'drizzle-orm'

import type { GetCreditBalanceQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { creditBalances } from '../../schema'

export const getCreditBalanceQuery: GetCreditBalanceQuery = async ({ userId }) => {
  try {
    const rows = await db
      .select({ balance: creditBalances.balance })
      .from(creditBalances)
      .where(eq(creditBalances.userId, userId))
      .limit(1)

    if (!rows[0]) return succeed(0)

    return succeed(rows[0].balance)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
