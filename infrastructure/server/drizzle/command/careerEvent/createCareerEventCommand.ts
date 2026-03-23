import type { CreateCareerEventCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerEventRowToEntity } from '../../converter'
import { careerEvents, careerMapEventTagAttachments } from '../../schema'

export const createCareerEventCommand: CreateCareerEventCommand = async (parameters) => {
  try {
    const [inserted] = await db.insert(careerEvents).values({
      careerMapId: parameters.careerMapId,
      name: parameters.name,
      type: parameters.type ?? 'working',
      startDate: parameters.startDate,
      endDate: parameters.endDate,
      strength: parameters.strength,
      row: parameters.row ?? 0,
      description: parameters.description ?? null,
    }).returning({ id: careerEvents.id })

    if (parameters.tags && parameters.tags.length > 0) {
      const attachments = [...new Set(parameters.tags)].map((tagId) => ({
        careerEventId: inserted.id,
        careerMapEventTagId: tagId,
      }))

      await db.insert(careerMapEventTagAttachments).values(attachments)
    }

    const fullRow = await db.query.careerEvents.findFirst({
      where: (ce, { eq }) => eq(ce.id, inserted.id),
      with: {
        tagAttachments: {
          with: {
            tag: true,
          },
        },
      },
    })

    return succeed(careerEventRowToEntity(fullRow!))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
