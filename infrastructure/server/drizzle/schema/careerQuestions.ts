import { relations, sql } from 'drizzle-orm'
import { check, index, integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { careerMaps } from './careerMaps'

export const careerQuestions = pgTable('career_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  careerMapId: uuid('career_map_id').notNull().references(() => careerMaps.id, { onDelete: 'cascade' }),
  name: text('name').notNull().default(''),
  title: text('title').notNull().default(''),
  status: text('status').notNull().default('open'),
  fields: jsonb('fields').notNull().default([]),
  row: integer('row'),
  startDate: text('start_date'),
  endDate: text('end_date'),
}, (table) => [
  index('career_questions_career_map_id_idx').on(table.careerMapId),
  check('career_questions_status_check', sql`${table.status} in ('open', 'closed')`),
])

export const careerQuestionsRelations = relations(careerQuestions, ({ one }) => ({
  careerMap: one(careerMaps, { fields: [careerQuestions.careerMapId], references: [careerMaps.id] }),
}))
