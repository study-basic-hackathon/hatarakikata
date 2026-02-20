import { z } from "zod"

export const SimilarCareerMapSchema = z.object({
  id: z.string(),
  score: z.number(),
  overlapTags: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
})

export type SimilarCareerMap = z.infer<typeof SimilarCareerMapSchema>
