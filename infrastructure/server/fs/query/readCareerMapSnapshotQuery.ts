import { readFileSync } from 'fs'
import { resolve } from 'path'

import type { ReadCareerMapSnapshotQuery } from '@/core/application/port/query'
import { CareerMapSnapshotSchema } from '@/core/domain/value/careerMapSnapshot'
import { failAsExternalServiceError, failAsInvalidParametersError, succeed } from '@/core/util/appResult'

export const readCareerMapSnapshotQuery: ReadCareerMapSnapshotQuery = async (filePath) => {
  try {
    const absolutePath = resolve(filePath)
    const content = readFileSync(absolutePath, 'utf-8')
    const json = JSON.parse(content)
    const validation = CareerMapSnapshotSchema.safeParse(json)

    if (!validation.success) {
      return failAsInvalidParametersError(validation.error.message, validation.error)
    }

    return succeed(validation.data)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
