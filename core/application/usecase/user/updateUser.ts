import { User } from "@/core/domain"
import { AppResult, failAsInvalidParametersError, failAsForbiddenError, failAsNotFoundError } from "@/core/util/appResult"
import { z } from "zod"
import { Executor } from "../../executor"
import { UpdateUserCommand, UpdateUserCommandParametersSchema } from "../../service/command"
import { FindUserQuery } from "../../service/query"

const UpdateUserParametersSchema = UpdateUserCommandParametersSchema

export type UpdateUserParametersInput = z.input<typeof UpdateUserParametersSchema>

export type UpdateUserParameters = z.infer<typeof UpdateUserParametersSchema>

export type UpdateUser = (
  input: UpdateUserParametersInput,
  executor: Executor
) => Promise<AppResult<User>>

export type MakeUpdateUserDependencies = {
  updateUserCommand: UpdateUserCommand
  findUserQuery: FindUserQuery
}

export function makeUpdateUser({
  updateUserCommand,
  findUserQuery,
}: MakeUpdateUserDependencies): UpdateUser {
  return async (input, executor) => {
    const validation = UpdateUserParametersSchema.safeParse(input)
    if (!validation.success) return failAsInvalidParametersError(validation.error)

    if (executor.type !== "user" || executor.userType !== "general") return failAsForbiddenError("Forbidden")

    const parameters = validation.data

    const findUserResult = await findUserQuery({ id: parameters.id })
    if (!findUserResult.success) return findUserResult

    if (!findUserResult.data) return failAsNotFoundError("User is not found")

    if (parameters.id !== executor.user.id) {
      return failAsForbiddenError("Forbidden")
    }

    return await updateUserCommand(parameters)
  }
}
