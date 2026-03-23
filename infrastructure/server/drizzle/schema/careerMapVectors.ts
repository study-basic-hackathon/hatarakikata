import { relations } from 'drizzle-orm'
import { jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'

import { careerMaps } from './careerMaps'
import { vector } from './customTypes'

export const careerMapVectors = pgTable('career_map_vectors', {
  careerMapId: uuid('career_map_id').primaryKey().references(() => careerMaps.id, { onDelete: 'cascade' }),
  embedding: vector('embedding').notNull(),
  tagWeights: jsonb('tag_weights').notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const careerMapVectorsRelations = relations(careerMapVectors, ({ one }) => ({
  careerMap: one(careerMaps, { fields: [careerMapVectors.careerMapId], references: [careerMaps.id] }),
}))
