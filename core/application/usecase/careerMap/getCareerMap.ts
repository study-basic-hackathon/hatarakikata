import { CareerMap } from "@/core/domain"
import { AppResult, failAsInvalidParametersError, failAsForbiddenError, failAsNotFoundError, succeed } from "@/core/util/appResult"
import { z } from "zod"
import { Executor } from "../../executor"
import { FindCareerMapQuery, FindCareerMapQueryParametersSchema } from "../../service/query"

const GetCareerMapParametersSchema = FindCareerMapQueryParametersSchema

export type GetCareerMapParametersInput = z.input<typeof GetCareerMapParametersSchema>

export type GetCareerMapParameters = z.infer<typeof GetCareerMapParametersSchema>

export type GetCareerMap = (
  input: GetCareerMapParametersInput,
  executor: Executor
) => Promise<AppResult<CareerMap>>

export type MakeGetCareerMapDependencies = {
  findCareerMapQuery: FindCareerMapQuery
}

export function makeGetCareerMap({
  findCareerMapQuery,
}: MakeGetCareerMapDependencies): GetCareerMap {
  return async (input, executor) => {
    const validation = GetCareerMapParametersSchema.safeParse(input)
    if (!validation.success) return failAsInvalidParametersError(validation.error)

    if (executor.type !== "user" || executor.userType !== "general") return failAsForbiddenError("Forbidden")

    const parameters = validation.data

    const findCareerMapResult = await findCareerMapQuery({ id: parameters.id })
    if (!findCareerMapResult.success) return findCareerMapResult

    const careerMap = findCareerMapResult.data
    if (!careerMap) return failAsNotFoundError("Career map is not found")

    if (careerMap.userId !== executor.user.id) {
      return failAsForbiddenError("Forbidden")
    }

    return succeed(careerMap)
  }
}
