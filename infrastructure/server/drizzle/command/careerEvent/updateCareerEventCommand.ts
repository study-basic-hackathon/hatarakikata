import { eq } from 'drizzle-orm'

import type { UpdateCareerEventCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerEvents, careerMapEventTagAttachments } from '../../schema'

export const updateCareerEventCommand: UpdateCareerEventCommand = async (parameters) => {
  try {
    const updateData: Record<string, unknown> = {}
    if (parameters.careerMapId !== undefined) updateData.careerMapId = parameters.careerMapId
    if (parameters.name !== undefined) updateData.name = parameters.name
    if (parameters.type !== undefined) updateData.type = parameters.type
    if (parameters.startDate !== undefined) updateData.startDate = parameters.startDate
    if (parameters.endDate !== undefined) updateData.endDate = parameters.endDate
    if (parameters.strength !== undefined) updateData.strength = parameters.strength
    if (parameters.row !== undefined) updateData.row = parameters.row
    if (parameters.description !== undefined) updateData.description = parameters.description

    if (Object.keys(updateData).length > 0) {
      await db.update(careerEvents).set(updateData).where(eq(careerEvents.id, parameters.id))
    }

    if (parameters.tags !== undefined) {
      await db.delete(careerMapEventTagAttachments).where(eq(careerMapEventTagAttachments.careerEventId, parameters.id))

      if (parameters.tags.length > 0) {
        const attachments = [...new Set(parameters.tags)].map((tagId) => ({
          careerEventId: parameters.id,
          careerMapEventTagId: tagId,
        }))

        await db.insert(careerMapEventTagAttachments).values(attachments)
      }
    }

    return succeed(undefined)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
