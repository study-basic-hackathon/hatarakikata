import { z } from "zod"

import type { CreateCareerMapVectorCommand } from "@/core/application/port/command"
import type { CreateEmbeddingOperation } from "@/core/application/port/operation"
import type { ListCareerEventsForVectorQuery } from "@/core/application/port/query"
import type { CareerMapVector } from "@/core/application/port/query/careerMapVector/findCareerMapVectorQuery"
import { buildCareerMapVectorData } from "@/core/domain/service/careerMap"
import { type AppResult, failAsInvalidParametersError, succeed } from "@/core/util/appResult"

const CreateCareerMapVectorParametersSchema = z.object({
  id: z.string().min(1),
})

export type CreateCareerMapVectorParametersInput = z.input<typeof CreateCareerMapVectorParametersSchema>

export type CreateCareerMapVectorOperation = (input: CreateCareerMapVectorParametersInput) => Promise<AppResult<CareerMapVector>>

export type MakeCreateCareerMapVectorOperationDependencies = {
  listCareerEventsForVectorQuery: ListCareerEventsForVectorQuery
  createEmbeddingOperation: CreateEmbeddingOperation
  createCareerMapVectorCommand: CreateCareerMapVectorCommand
}

export function makeCreateCareerMapVectorOperation({
  listCareerEventsForVectorQuery,
  createEmbeddingOperation,
  createCareerMapVectorCommand,
}: MakeCreateCareerMapVectorOperationDependencies): CreateCareerMapVectorOperation {
  return async (input) => {
    const validation = CreateCareerMapVectorParametersSchema.safeParse(input)
    if (!validation.success) return failAsInvalidParametersError(validation.error.message, validation.error)

    const careerMapId = validation.data.id

    const eventsResult = await listCareerEventsForVectorQuery(careerMapId)
    if (!eventsResult.success) return eventsResult

    const vectorData = buildCareerMapVectorData(eventsResult.data)

    const embeddingResult = await createEmbeddingOperation({ text: vectorData.text })
    if (!embeddingResult.success) return embeddingResult

    const embedding = embeddingResult.data
    const tagWeights = vectorData.tagWeights

    const createResult = await createCareerMapVectorCommand({
      careerMapId,
      embedding,
      tagWeights,
    })
    if (!createResult.success) return createResult

    return succeed({ careerMapId, embedding, tagWeights })
  }
}
