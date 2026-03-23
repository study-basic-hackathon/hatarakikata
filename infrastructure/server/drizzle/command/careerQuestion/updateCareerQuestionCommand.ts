import { eq } from 'drizzle-orm'

import type { UpdateCareerQuestionCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerQuestions } from '../../schema'

export const updateCareerQuestionCommand: UpdateCareerQuestionCommand = async (parameters) => {
  try {
    const updateData: Record<string, unknown> = {}
    if (parameters.careerMapId !== undefined) updateData.careerMapId = parameters.careerMapId
    if (parameters.name !== undefined) updateData.name = parameters.name
    if (parameters.title !== undefined) updateData.title = parameters.title
    if (parameters.status !== undefined) updateData.status = parameters.status
    if (parameters.fields !== undefined) updateData.fields = parameters.fields
    if (parameters.row !== undefined) updateData.row = parameters.row
    if (parameters.startDate !== undefined) updateData.startDate = parameters.startDate
    if (parameters.endDate !== undefined) updateData.endDate = parameters.endDate

    if (Object.keys(updateData).length > 0) {
      await db.update(careerQuestions).set(updateData).where(eq(careerQuestions.id, parameters.id))
    }

    return succeed(undefined)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
