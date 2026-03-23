import type { CreateCareerMapVectorCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerMapVectors } from '../../schema'

export const createCareerMapVectorCommand: CreateCareerMapVectorCommand = async (parameters) => {
  try {
    await db.insert(careerMapVectors).values({
      careerMapId: parameters.careerMapId,
      embedding: parameters.embedding as unknown as number[],
      tagWeights: parameters.tagWeights,
      updatedAt: new Date(),
    })

    return succeed(undefined)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
