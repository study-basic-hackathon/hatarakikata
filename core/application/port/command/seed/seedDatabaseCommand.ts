import type { AppResult } from '@/core/util'

export type SeedDatabaseCommandParameters = {
  eventTagNames: string[]
  invitationCodes: string[]
}

export type SeedDatabaseCommand = (parameters: SeedDatabaseCommandParameters) => Promise<AppResult<undefined>>
