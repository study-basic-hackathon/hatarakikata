import { eq } from 'drizzle-orm'

import type { UpdateCareerMapVectorCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerMapVectors } from '../../schema'

export const updateCareerMapVectorCommand: UpdateCareerMapVectorCommand = async (parameters) => {
  try {
    await db.update(careerMapVectors).set({
      embedding: parameters.embedding as unknown as number[],
      tagWeights: parameters.tagWeights,
      updatedAt: new Date(),
    }).where(eq(careerMapVectors.careerMapId, parameters.careerMapId))

    return succeed(undefined)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
