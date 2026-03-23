import type { User } from '@/core/domain/entity/user'

import type { creditBalances, memberships, users } from '../schema'

type UserRow = typeof users.$inferSelect
type CreditBalanceRow = typeof creditBalances.$inferSelect
type MembershipRow = typeof memberships.$inferSelect

export function userRowToEntity(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    balance: 0,
    membership: { plan: 'free' },
  }
}

export function userRowWithCreditAndMembershipToEntity(
  row: UserRow & { creditBalance: CreditBalanceRow | null; membership: MembershipRow | null },
): User {
  return {
    id: row.id,
    name: row.name,
    balance: row.creditBalance?.balance ?? 0,
    membership: { plan: (row.membership?.plan ?? 'free') as 'free' | 'premium' },
  }
}
