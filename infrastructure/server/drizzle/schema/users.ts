import { relations } from 'drizzle-orm'
import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { careerGuides } from './careerGuides'
import { careerMaps } from './careerMaps'
import { creditBalances } from './creditBalances'
import { creditTransactions } from './creditTransactions'
import { memberships } from './memberships'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
})

export const usersRelations = relations(users, ({ many, one }) => ({
  careerMaps: many(careerMaps),
  careerGuides: many(careerGuides),
  membership: one(memberships),
  creditBalance: one(creditBalances),
  creditTransactions: many(creditTransactions),
}))
