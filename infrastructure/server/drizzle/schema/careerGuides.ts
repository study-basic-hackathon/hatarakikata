import { relations } from 'drizzle-orm'
import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { careerMaps } from './careerMaps'
import { users } from './users'

export const careerGuides = pgTable('career_guides', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  baseCareerMapId: uuid('base_career_map_id').notNull().references(() => careerMaps.id, { onDelete: 'cascade' }),
  guideCareerMapId: uuid('guide_career_map_id').notNull().references(() => careerMaps.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  nextActions: jsonb('next_actions').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('career_guides_user_id_idx').on(table.userId),
  index('career_guides_base_career_map_id_idx').on(table.baseCareerMapId),
  index('career_guides_guide_career_map_id_idx').on(table.guideCareerMapId),
])

export const careerGuidesRelations = relations(careerGuides, ({ one }) => ({
  user: one(users, { fields: [careerGuides.userId], references: [users.id] }),
  baseCareerMap: one(careerMaps, { fields: [careerGuides.baseCareerMapId], references: [careerMaps.id] }),
  guideCareerMap: one(careerMaps, { fields: [careerGuides.guideCareerMapId], references: [careerMaps.id] }),
}))
