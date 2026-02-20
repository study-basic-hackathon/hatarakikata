import { z } from "zod"

import type { Executor } from "@/core/application/executor"
import type { CreateCareerEventCommand } from "@/core/application/port/command"
import type { GenerateCareerEventsOperation } from "@/core/application/port/operation"
import type { FindCareerMapQuery, ListCareerMapEventTagsQuery } from "@/core/application/port/query"
import type { CareerEvent } from "@/core/domain"
import { CareerEventSchema } from "@/core/domain"
import { type AppResult, failAsForbiddenError, failAsInvalidParametersError, failAsNotFoundError, succeed } from "@/core/util/appResult"

const GenerateCareerEventsParametersSchema = z.object({
  careerMapId: z.string(),
  input: z.string().min(1),
  currentEvents: z.array(CareerEventSchema).optional().default([]),
})

export type GenerateCareerEventsParametersInput = z.input<
  typeof GenerateCareerEventsParametersSchema
>

export type GenerateCareerEventsParameters = z.infer<
  typeof GenerateCareerEventsParametersSchema
>

type GenerateCareerEventsUsecaseResult = {
  events: CareerEvent[]
  nextQuestion: { content: string } | null
}

export type GenerateCareerEventsUsecase = (
  input: GenerateCareerEventsParametersInput,
  executor: Executor
) => Promise<AppResult<GenerateCareerEventsUsecaseResult>>

export type MakeGenerateCareerEventsDependencies = {
  generateCareerEvents: GenerateCareerEventsOperation
  createCareerEventCommand: CreateCareerEventCommand
  findCareerMapQuery: FindCareerMapQuery
  listCareerMapEventTagsQuery: ListCareerMapEventTagsQuery
}

export function makeGenerateCareerEvents({
  generateCareerEvents,
  createCareerEventCommand,
  findCareerMapQuery,
  listCareerMapEventTagsQuery,
}: MakeGenerateCareerEventsDependencies): GenerateCareerEventsUsecase {
  return async (input, executor) => {
    const validation = GenerateCareerEventsParametersSchema.safeParse(input)
    if (!validation.success) return failAsInvalidParametersError(validation.error.message, validation.error)

    if (executor.type !== "user" || executor.userType !== "general") {
      return failAsForbiddenError("Forbidden")
    }

    const parameters = validation.data

    const findCareerMapResult = await findCareerMapQuery({ id: parameters.careerMapId })
    if (!findCareerMapResult.success) return findCareerMapResult

    const careerMap = findCareerMapResult.data
    if (!careerMap) return failAsNotFoundError("Career map is not found")

    if (careerMap.userId !== executor.user.id) {
      return failAsForbiddenError("Forbidden")
    }

    const tagResult = await listCareerMapEventTagsQuery()
    if (!tagResult.success) return tagResult

    const tags = tagResult.data.items.map((tag) => ({ id: tag.id, name: tag.name }))

    const generateResult = await generateCareerEvents({
      question: parameters.input,
      content: parameters.currentEvents ?? [],
      map: careerMap,
      tags,
    })

    if (!generateResult.success) return generateResult

    const createdEvents = await Promise.all(
      generateResult.data.events.map(async (generated) => {
        const result = await createCareerEventCommand({
          careerMapId: parameters.careerMapId,
          ...generated,
        })
        if (!result.success) throw new Error(`Failed to create event: ${result.error.message}`)
        return result.data
      })
    )

    return succeed({
      events: createdEvents,
      nextQuestion: generateResult.data.nextQuestion,
    })
  }
}
