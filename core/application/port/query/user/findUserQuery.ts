import { z } from "zod"

import { User, UserKeySchema } from "@/core/domain"
import { AppResult } from "@/core/util/appResult"

export const FindUserQueryParametersSchema = UserKeySchema

export type FindUserQueryParametersInput = z.input<typeof FindUserQueryParametersSchema>

export type FindUserQueryParameters = z.infer<typeof FindUserQueryParametersSchema>

export type FindUserQuery = (parameters: FindUserQueryParametersInput) => Promise<AppResult<null | User>>
