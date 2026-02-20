import 'dotenv/config'

import type { SystemExecutor } from '../core/application/executor'
import { reindexAllCareerMapVectors } from './usecase/careerMap'

async function main() {
  const executor: SystemExecutor = {
    type: 'system',
    operation: { name: 'reindex-vectors' },
  }

  const result = await reindexAllCareerMapVectors(executor)

  if (!result.success) {
    console.error('Failed:', result.error.message)
    process.exit(1)
  }

  console.log(`Done: ${result.data.processed} processed, ${result.data.failed} failed`)
}

main()
