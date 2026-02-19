import z from "zod"

import { createPagedItemsSchema } from "@/core/domain/schema"

export const CareerMapEventTagKeySchema = z.object({
  id: z.string(),
})

export const CareerMapEventTagPayloadSchema = z.object({
  name: z.string(),
})

export const CareerMapEventTagSchema = CareerMapEventTagKeySchema.extend(
  CareerMapEventTagPayloadSchema.shape
)
export type CareerMapEventTag = z.infer<typeof CareerMapEventTagSchema>

export const PagedCareerMapEventTagsSchema = createPagedItemsSchema(CareerMapEventTagSchema)
export type PagedCareerMapEventTags = z.infer<typeof PagedCareerMapEventTagsSchema>
