import { z } from "zod"

export const CareerMapRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  start_date: z.string().nullable(),
})
export type CareerMapRow = z.infer<typeof CareerMapRowSchema>
