import type { FindCareerQuestionQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerQuestionRowToEntity } from '../../converter'

export const findCareerQuestionQuery: FindCareerQuestionQuery = async ({ id }) => {
  try {
    const row = await db.query.careerQuestions.findFirst({
      where: (careerQuestions, { eq }) => eq(careerQuestions.id, id),
    })

    if (!row) return succeed(null)

    return succeed(careerQuestionRowToEntity(row))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
