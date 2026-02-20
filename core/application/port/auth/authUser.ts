import { z } from 'zod'

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.email(),
})

export type AuthUser = z.infer<typeof AuthUserSchema>
