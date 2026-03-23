import 'dotenv/config'

import type { SystemExecutor } from '../core/application/executor'
import { createSeedDatabase } from './usecase/seed'

async function main() {
  const executor: SystemExecutor = {
    type: 'system',
    operation: { name: 'seed' },
  }

  console.log('Seeding database...')

  const seedDatabase = createSeedDatabase()
  const result = await seedDatabase(executor)

  if (!result.success) {
    console.error('Failed:', result.error.message)
    process.exit(1)
  }

  console.log(`Done: ${result.data.eventTagCount} tags, ${result.data.invitationCodeCount} invitation codes`)
  process.exit(0)
}

main()
