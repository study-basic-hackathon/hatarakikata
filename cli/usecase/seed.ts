import { makeSeedDatabase } from '@/core/application/usecase/seed'
import { seedDatabaseCommand } from '@/infrastructure/server/drizzle/command'

export function createSeedDatabase() {
  return makeSeedDatabase({
    seedDatabaseCommand,
  })
}
