import { z } from "zod"

import { User, UserKeySchema, UserPayloadSchema } from "@/core/domain"
import { AppResult } from "@/core/util/appResult"

export const CreateUserCommandParametersSchema = UserKeySchema.extend(UserPayloadSchema.shape)

export type CreateUserCommandParametersInput = z.input<typeof CreateUserCommandParametersSchema>

export type CreateUserCommandParameters = z.infer<typeof CreateUserCommandParametersSchema>

export type CreateUserCommand = (parameters: CreateUserCommandParametersInput) => Promise<AppResult<User>>
