import type { ListCareerQuestionsByCareerMapIdQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerQuestionRowToEntity } from '../../converter'

export const listCareerQuestionsByCareerMapIdQuery: ListCareerQuestionsByCareerMapIdQuery = async ({ careerMapId }) => {
  try {
    const rows = await db.query.careerQuestions.findMany({
      where: (careerQuestions, { eq }) => eq(careerQuestions.careerMapId, careerMapId),
    })

    return succeed(rows.map(careerQuestionRowToEntity))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
