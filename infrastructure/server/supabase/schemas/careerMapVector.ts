import { z } from "zod"

export const CareerMapVectorRowSchema = z.object({
  career_map_id: z.string(),
  embedding: z.string(),
  tag_weights: z.record(z.string(), z.number()).nullable(),
})
export type CareerMapVectorRow = z.infer<typeof CareerMapVectorRowSchema>
