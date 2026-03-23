import { z } from "zod"

import type { AppResult } from "@/core/util/appResult"

export const UserCredentialSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
})

export type UserCredential = z.infer<typeof UserCredentialSchema>

export type WriteUserCredentialsCommand = (credentials: UserCredential[]) => Promise<AppResult<void>>
