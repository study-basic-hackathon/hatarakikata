import { relations, sql } from 'drizzle-orm'
import { check, integer, pgTable, uuid } from 'drizzle-orm/pg-core'

import { users } from './users'

export const creditBalances = pgTable('credit_balances', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  balance: integer('balance').notNull().default(0),
}, (table) => [
  check('credit_balances_balance_check', sql`${table.balance} >= 0`),
])

export const creditBalancesRelations = relations(creditBalances, ({ one }) => ({
  user: one(users, { fields: [creditBalances.userId], references: [users.id] }),
}))
