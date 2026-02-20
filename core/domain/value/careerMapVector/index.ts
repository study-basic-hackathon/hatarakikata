import { z } from "zod"

export const CareerMapVectorDataSchema = z.object({
  text: z.string(),
  tagWeights: z.record(z.string(), z.number()),
})

export type CareerMapVectorData = z.infer<typeof CareerMapVectorDataSchema>
