import { relations } from 'drizzle-orm'
import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { careerEvents } from './careerEvents'
import { careerMapVectors } from './careerMapVectors'
import { careerQuestions } from './careerQuestions'
import { users } from './users'

export const careerMaps = pgTable('career_maps', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  startDate: text('start_date'),
}, (table) => [
  index('career_maps_user_id_idx').on(table.userId),
])

export const careerMapsRelations = relations(careerMaps, ({ one, many }) => ({
  user: one(users, { fields: [careerMaps.userId], references: [users.id] }),
  careerEvents: many(careerEvents),
  careerQuestions: many(careerQuestions),
  careerMapVector: one(careerMapVectors),
}))
