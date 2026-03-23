import type { CreateCareerQuestionCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerQuestionRowToEntity } from '../../converter'
import { careerQuestions } from '../../schema'

export const createCareerQuestionCommand: CreateCareerQuestionCommand = async (parameters) => {
  try {
    const [row] = await db.insert(careerQuestions).values({
      careerMapId: parameters.careerMapId,
      name: parameters.name,
      title: parameters.title,
      status: parameters.status ?? 'open',
      fields: parameters.fields,
      row: parameters.row ?? null,
      startDate: parameters.startDate ?? null,
      endDate: parameters.endDate ?? null,
    }).returning()

    return succeed(careerQuestionRowToEntity(row))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
