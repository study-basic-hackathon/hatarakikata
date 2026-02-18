import { z } from "zod";
import { createPagedItemsSchema } from "@/core/domain/schema"

export const CareerMapKeySchema = z.object({
  id: z.string(),
})

export const CareerMapPayloadSchema = z.object({
  userId: z.string(),
  startDate: z.string().nullable(),
})

export const CareerMapSchema = CareerMapKeySchema.extend(CareerMapPayloadSchema.shape).extend({
  endDate: z.string(),
})
export type CareerMap = z.infer<typeof CareerMapSchema>

export const PagedCareerMapsSchema = createPagedItemsSchema(CareerMapSchema)
export type PagedCareerMaps = z.infer<typeof PagedCareerMapsSchema>
