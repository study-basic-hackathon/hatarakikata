import { desc, eq } from 'drizzle-orm'

import type { ListCreditTransactionsQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { creditTransactions } from '../../schema'

export const listCreditTransactionsQuery: ListCreditTransactionsQuery = async ({ userId }) => {
  try {
    const rows = await db
      .select({
        id: creditTransactions.id,
        amount: creditTransactions.amount,
        type: creditTransactions.type,
        operation: creditTransactions.operation,
        createdAt: creditTransactions.createdAt,
      })
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt))

    return succeed(
      rows.map((row) => ({
        id: row.id,
        amount: row.amount,
        type: row.type as 'grant' | 'usage',
        operation: row.operation,
        createdAt: row.createdAt.toISOString(),
      })),
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
