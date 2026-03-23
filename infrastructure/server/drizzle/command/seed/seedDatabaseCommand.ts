import { reset, seed } from 'drizzle-seed'

import type { SeedDatabaseCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { careerMapEventTags, invitationCodes } from '../../schema'

export const seedDatabaseCommand: SeedDatabaseCommand = async (parameters) => {
  try {
    await reset(db, { careerMapEventTags, invitationCodes })

    await seed(db, { careerMapEventTags, invitationCodes }).refine((funcs) => ({
      careerMapEventTags: {
        count: parameters.eventTagNames.length,
        columns: {
          name: funcs.valuesFromArray({ values: parameters.eventTagNames, isUnique: true }),
        },
      },
      invitationCodes: {
        count: parameters.invitationCodes.length,
        columns: {
          code: funcs.valuesFromArray({ values: parameters.invitationCodes, isUnique: true }),
        },
      },
    }))

    return succeed(undefined)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
