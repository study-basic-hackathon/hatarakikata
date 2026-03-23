import { eq } from 'drizzle-orm'

import type { UpdateCareerMapCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerMapRowToEntity } from '../../converter'
import { careerMaps } from '../../schema'

export const updateCareerMapCommand: UpdateCareerMapCommand = async (parameters) => {
  try {
    const updateData: Record<string, unknown> = {}
    if (parameters.userId !== undefined) updateData.userId = parameters.userId
    if (parameters.startDate !== undefined) updateData.startDate = parameters.startDate

    const [row] = await db.update(careerMaps).set(updateData).where(eq(careerMaps.id, parameters.id)).returning()

    return succeed(careerMapRowToEntity(row))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
