import { z } from "zod"

export const UserRowSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
})
export type UserRow = z.infer<typeof UserRowSchema>

export const CareerMapRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  start_date: z.string().nullable(),
})
export type CareerMapRow = z.infer<typeof CareerMapRowSchema>

export const CareerEventRowSchema = z.object({
  id: z.string(),
  career_map_id: z.string(),
  name: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  strength: z.number().int().min(1).max(5),
  row: z.number().int().min(0),
  description: z.string().nullable(),
})
export type CareerEventRow = z.infer<typeof CareerEventRowSchema>

export const CareerMapEventTagRowSchema = z.object({
  id: z.string(),
  name: z.string(),
})
export type CareerMapEventTagRow = z.infer<typeof CareerMapEventTagRowSchema>

export const CareerEventWithTagsRowSchema = CareerEventRowSchema.extend({
  career_map_event_tag_attachments: z.array(
    z.object({
      career_map_event_tags: CareerMapEventTagRowSchema,
    })
  ).default([]),
})
export type CareerEventWithTagsRow = z.infer<typeof CareerEventWithTagsRowSchema>