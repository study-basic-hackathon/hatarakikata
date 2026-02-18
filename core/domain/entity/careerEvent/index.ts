import z from "zod"
import { createPagedItemsSchema } from "@/core/domain/schema"

export const CareerEventKeySchema = z.object({
  id: z.string(),
})

export const CareerEventPayloadBaseSchema = z.object({
  careerMapId: z.string(),
  name: z.string().default(""),
  startDate: z.string(),
  endDate: z.string(),
  tags: z.array(z.string()),
  strength: z.number().int().min(1).max(5).default(3),
  row: z.number().int().min(0).default(0),
  description: z.string().nullable().default(null),
})

export const CareerEventPayloadSchema = CareerEventPayloadBaseSchema

export const CareerEventSchema = CareerEventKeySchema.extend(CareerEventPayloadBaseSchema.shape)
export type CareerEvent = z.infer<typeof CareerEventSchema>
export type CareerEventPayload = z.infer<typeof CareerEventPayloadSchema>

export const PagedCareerEventsSchema = createPagedItemsSchema(CareerEventSchema)
export type PagedCareerEvents = z.infer<typeof PagedCareerEventsSchema>
