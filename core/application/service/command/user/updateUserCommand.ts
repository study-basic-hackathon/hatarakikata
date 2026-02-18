import { User, UserKeySchema, UserPayloadSchema } from "@/core/domain"
import { AppResult } from "@/core/util/appResult"
import { z } from "zod"

export const UpdateUserCommandParametersSchema = UserKeySchema.extend(UserPayloadSchema.partial().shape)

export type UpdateUserCommandParametersInput = z.input<typeof UpdateUserCommandParametersSchema>

export type UpdateUserCommandParameters = z.infer<typeof UpdateUserCommandParametersSchema>

export type UpdateUserCommand = (parameters: UpdateUserCommandParametersInput) => Promise<AppResult<User>>
