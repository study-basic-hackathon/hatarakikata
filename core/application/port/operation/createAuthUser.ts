import { z } from "zod"

import type { AppResult } from "@/core/util/appResult"

export const CreateAuthUserOperationParametersSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export type CreateAuthUserOperationParametersInput = z.input<
  typeof CreateAuthUserOperationParametersSchema
>

export type CreateAuthUserOperationParameters = z.infer<
  typeof CreateAuthUserOperationParametersSchema
>

export type CreateAuthUserOperationResult = {
  id: string
}

export type CreateAuthUserOperation = (
  parameters: CreateAuthUserOperationParameters
) => Promise<AppResult<CreateAuthUserOperationResult>>
