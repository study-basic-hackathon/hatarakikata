import { relations, sql } from 'drizzle-orm'
import { check, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { users } from './users'

export const memberships = pgTable('memberships', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  plan: text('plan').notNull().default('free'),
}, (table) => [
  check('memberships_plan_check', sql`${table.plan} in ('free', 'premium')`),
])

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
}))
