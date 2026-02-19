import { z } from "zod"

import { CareerEvent } from "@/core/domain"
import { AppResult, failAsForbiddenError, failAsInvalidParametersError, failAsNotFoundError, succeed } from "@/core/util/appResult"

import { Executor } from "../../executor"
import { UpdateCareerEventCommand, UpdateCareerEventCommandParametersSchema } from "../../service/command"
import { FindCareerEventQuery, FindCareerMapQuery } from "../../service/query"

const UpdateCareerEventParametersSchema = UpdateCareerEventCommandParametersSchema

export type UpdateCareerEventParametersInput = z.input<typeof UpdateCareerEventParametersSchema>

export type UpdateCareerEventParameters = z.infer<typeof UpdateCareerEventParametersSchema>

export type UpdateCareerEvent = (
  input: UpdateCareerEventParametersInput,
  executor: Executor
) => Promise<AppResult<CareerEvent>>

export type MakeUpdateCareerEventDependencies = {
  updateCareerEventCommand: UpdateCareerEventCommand
  findCareerEventQuery: FindCareerEventQuery
  findCareerMapQuery: FindCareerMapQuery
}

export function makeUpdateCareerEvent({
  updateCareerEventCommand,
  findCareerEventQuery,
  findCareerMapQuery,
}: MakeUpdateCareerEventDependencies): UpdateCareerEvent {
  return async (input, executor) => {
    const validation = UpdateCareerEventParametersSchema.safeParse(input)
    if (!validation.success) return failAsInvalidParametersError(validation.error.message, validation.error)

    if (executor.type !== "user" || executor.userType !== "general") return failAsForbiddenError("Forbidden")

    const parameters = validation.data

    const findCareerEventResult = await findCareerEventQuery({ id: parameters.id })
    if (!findCareerEventResult.success) return findCareerEventResult

    const careerEvent = findCareerEventResult.data
    if (!careerEvent) return failAsNotFoundError("Career event is not found")

    const findCareerMapResult = await findCareerMapQuery({ id: careerEvent.careerMapId })
    if (!findCareerMapResult.success) return findCareerMapResult

    const careerMap = findCareerMapResult.data
    if (!careerMap) return failAsNotFoundError("Career map is not found")

    if (careerMap.userId !== executor.user.id) {
      return failAsForbiddenError("Forbidden")
    }

    const updateResult = await updateCareerEventCommand(parameters)
    if (!updateResult.success) return updateResult

    const updatedCareerEventResult = await findCareerEventQuery({ id: parameters.id })
    if (!updatedCareerEventResult.success) return updatedCareerEventResult

    const updatedCareerEvent = updatedCareerEventResult.data
    if (!updatedCareerEvent) return failAsNotFoundError("Career event is not found")

    return succeed(updatedCareerEvent)
  }
}
