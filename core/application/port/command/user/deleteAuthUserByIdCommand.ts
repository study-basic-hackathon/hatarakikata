import { z } from "zod"

import type { AppResult } from "@/core/util/appResult"

export const DeleteAuthUserByIdCommandParametersSchema = z.object({
  id: z.string(),
})

export type DeleteAuthUserByIdCommandParametersInput = z.input<typeof DeleteAuthUserByIdCommandParametersSchema>

export type DeleteAuthUserByIdCommandParameters = z.infer<typeof DeleteAuthUserByIdCommandParametersSchema>

export type DeleteAuthUserByIdCommand = (
  parameters: DeleteAuthUserByIdCommandParametersInput
) => Promise<AppResult<void>>
