import { relations } from 'drizzle-orm'
import { index, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core'

import { careerEvents } from './careerEvents'
import { careerMapEventTags } from './careerMapEventTags'

export const careerMapEventTagAttachments = pgTable('career_map_event_tag_attachments', {
  careerEventId: uuid('career_event_id').notNull().references(() => careerEvents.id, { onDelete: 'cascade' }),
  careerMapEventTagId: uuid('career_map_event_tag_id').notNull().references(() => careerMapEventTags.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.careerEventId, table.careerMapEventTagId] }),
  index('career_map_event_tag_attachments_career_event_id_idx').on(table.careerEventId),
  index('career_map_event_tag_attachments_tag_id_idx').on(table.careerMapEventTagId),
])

export const careerMapEventTagAttachmentsRelations = relations(careerMapEventTagAttachments, ({ one }) => ({
  careerEvent: one(careerEvents, { fields: [careerMapEventTagAttachments.careerEventId], references: [careerEvents.id] }),
  tag: one(careerMapEventTags, { fields: [careerMapEventTagAttachments.careerMapEventTagId], references: [careerMapEventTags.id] }),
}))
