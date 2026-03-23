import { eq } from 'drizzle-orm'

import type { CreateCreditTransactionCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { creditBalances, creditTransactions } from '../../schema'

export const createCreditTransactionCommand: CreateCreditTransactionCommand = async (parameters) => {
  try {
    const balanceChange = parameters.type === 'grant' ? parameters.amount : -parameters.amount

    await db.insert(creditTransactions).values({
      userId: parameters.userId,
      amount: balanceChange,
      type: parameters.type,
      operation: parameters.operation ?? null,
    })

    const currentRows = await db
      .select({ balance: creditBalances.balance })
      .from(creditBalances)
      .where(eq(creditBalances.userId, parameters.userId))
      .limit(1)

    const current = currentRows[0]
    const newBalance = Math.max(0, (current?.balance ?? 0) + balanceChange)

    if (current) {
      await db.update(creditBalances).set({ balance: newBalance }).where(eq(creditBalances.userId, parameters.userId))
    } else {
      await db.insert(creditBalances).values({ userId: parameters.userId, balance: newBalance })
    }

    return succeed(undefined)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
