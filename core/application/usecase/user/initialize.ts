import { User } from "@/core/domain"
import { AppResult, failAsForbiddenError,failAsInvalidParametersError } from "@/core/util/appResult"

import { Executor } from "../../executor"
import { CreateCareerMapCommand,CreateUserCommand } from "../../port/command"
import { FindUserQuery } from "../../port/query"

export type Initialize = (
  executor: Executor
) => Promise<AppResult<User>>

export type MakeInitializeDependencies = {
  createUserCommand: CreateUserCommand
  createCareerMapCommand: CreateCareerMapCommand
  findUserQuery: FindUserQuery
}

export function makeInitialize({
  createUserCommand,
  createCareerMapCommand,
  findUserQuery,
}: MakeInitializeDependencies): Initialize {
  return async (executor) => {
    if (executor.type !== "user" || executor.userType !== "general") return failAsForbiddenError("Forbidden")

    const findUserResult = await findUserQuery({ id: executor.user.id })
    if (!findUserResult.success) return findUserResult

    if (findUserResult.data) return failAsInvalidParametersError("User already exists")

    const createUserResult = await createUserCommand({ id: executor.user.id, name: null })
    if (!createUserResult.success) return createUserResult

    const createCareerMapResult = await createCareerMapCommand({ userId: executor.user.id, startDate: null })
    if (!createCareerMapResult.success) return createCareerMapResult

    return createUserResult
  }
}
