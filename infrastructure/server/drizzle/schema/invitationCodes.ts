import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const invitationCodes = pgTable('invitation_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
