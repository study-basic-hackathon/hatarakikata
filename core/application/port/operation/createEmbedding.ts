import { z } from "zod"

import { AppResult } from "@/core/util/appResult"

export const CreateEmbeddingOperationParametersSchema = z.object({
  text: z.string().min(1),
})

export type CreateEmbeddingOperationParametersInput = z.input<typeof CreateEmbeddingOperationParametersSchema>

export type CreateEmbeddingOperation = (parameters: CreateEmbeddingOperationParametersInput) => Promise<AppResult<number[]>>
