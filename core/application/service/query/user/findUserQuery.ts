import { User, UserKeySchema } from "@/core/domain"
import { AppResult } from "@/core/util/appResult"
import { z } from "zod"

export const FindUserQueryParametersSchema = UserKeySchema

export type FindUserQueryParametersInput = z.input<typeof FindUserQueryParametersSchema>

export type FindUserQueryParameters = z.infer<typeof FindUserQueryParametersSchema>

export type FindUserQuery = (parameters: FindUserQueryParametersInput) => Promise<AppResult<null | User>>
