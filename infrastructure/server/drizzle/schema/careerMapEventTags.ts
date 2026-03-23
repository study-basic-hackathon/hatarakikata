import { relations } from 'drizzle-orm'
import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { careerMapEventTagAttachments } from './careerMapEventTagAttachments'

export const careerMapEventTags = pgTable('career_map_event_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
})

export const careerMapEventTagsRelations = relations(careerMapEventTags, ({ many }) => ({
  attachments: many(careerMapEventTagAttachments),
}))
