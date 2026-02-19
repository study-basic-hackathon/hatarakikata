import { z } from "zod"

export const UserRowSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
})
export type UserRow = z.infer<typeof UserRowSchema>
