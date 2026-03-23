import type { CreateCareerMapCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerMapRowToEntity } from '../../converter'
import { careerMaps } from '../../schema'

export const createCareerMapCommand: CreateCareerMapCommand = async ({ userId, startDate }) => {
  try {
    const values: Record<string, unknown> = { userId }
    if (startDate !== undefined && startDate !== null) values.startDate = startDate

    const [row] = await db.insert(careerMaps).values(values as typeof careerMaps.$inferInsert).returning()

    return succeed(careerMapRowToEntity(row))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
