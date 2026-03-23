import { relations, sql } from 'drizzle-orm'
import { check, index, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { careerMapEventTagAttachments } from './careerMapEventTagAttachments'
import { careerMaps } from './careerMaps'

export const careerEvents = pgTable('career_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  careerMapId: uuid('career_map_id').notNull().references(() => careerMaps.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull().default('working'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  strength: integer('strength').notNull().default(3),
  row: integer('row').notNull().default(0),
  description: text('description'),
}, (table) => [
  index('career_events_career_map_id_idx').on(table.careerMapId),
  check('career_events_type_check', sql`${table.type} in ('living', 'working', 'feeling')`),
  check('career_events_end_date_check', sql`${table.endDate} != ${table.startDate}`),
  check('career_events_strength_check', sql`${table.strength} >= 1 and ${table.strength} <= 5`),
])

export const careerEventsRelations = relations(careerEvents, ({ one, many }) => ({
  careerMap: one(careerMaps, { fields: [careerEvents.careerMapId], references: [careerMaps.id] }),
  tagAttachments: many(careerMapEventTagAttachments),
}))
