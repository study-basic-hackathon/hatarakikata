import type { CreateCareerGuideCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerGuideRowToEntity } from '../../converter'
import { careerGuides } from '../../schema'

export const createCareerGuideCommand: CreateCareerGuideCommand = async (parameters) => {
  try {
    const [row] = await db.insert(careerGuides).values({
      userId: parameters.userId,
      baseCareerMapId: parameters.baseCareerMapId,
      guideCareerMapId: parameters.guideCareerMapId,
      content: parameters.content,
      nextActions: parameters.nextActions,
    }).returning()

    return succeed(careerGuideRowToEntity(row))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
