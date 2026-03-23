import { eq } from 'drizzle-orm'

import type { DeleteCareerEventCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerEvents } from '../../schema'

export const deleteCareerEventCommand: DeleteCareerEventCommand = async ({ id }) => {
  try {
    await db.delete(careerEvents).where(eq(careerEvents.id, id))

    return succeed(undefined)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
