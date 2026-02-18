import { User, UserKeySchema } from "@/core/domain"
import { AppResult } from "@/core/util/appResult"
import { z } from "zod"

export const DeleteUserCommandParametersSchema = UserKeySchema

export type DeleteUserCommandParametersInput = z.input<typeof DeleteUserCommandParametersSchema>

export type DeleteUserCommandParameters = z.infer<typeof DeleteUserCommandParametersSchema>

export type DeleteUserCommand = (parameters: DeleteUserCommandParametersInput) => Promise<AppResult<User>>
