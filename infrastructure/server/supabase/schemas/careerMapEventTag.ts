import { z } from "zod"

export const CareerMapEventTagRowSchema = z.object({
  id: z.string(),
  name: z.string(),
})
export type CareerMapEventTagRow = z.infer<typeof CareerMapEventTagRowSchema>
