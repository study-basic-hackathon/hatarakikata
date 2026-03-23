import { eq } from 'drizzle-orm'

import type { DeleteCareerMapCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerMapRowToEntity } from '../../converter'
import { careerMaps } from '../../schema'

export const deleteCareerMapCommand: DeleteCareerMapCommand = async ({ id }) => {
  try {
    const [row] = await db.delete(careerMaps).where(eq(careerMaps.id, id)).returning()

    return succeed(careerMapRowToEntity(row))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
