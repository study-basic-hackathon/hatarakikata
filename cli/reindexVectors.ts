import 'dotenv/config'

import cliProgress from 'cli-progress'

import type { CareerMapVectorEncoding } from '../core/domain/service/careerMap'
import type { SystemExecutor } from '../core/application/executor'
import { createReindexAllCareerMapVectors } from './usecase/careerMap'

function parseEncoding(): CareerMapVectorEncoding {
  const arg = process.argv.find((a) => a.startsWith('--encoding='))
  if (!arg) return 'toon'
  const value = arg.split('=')[1]
  if (value === 'toon' || value === 'natural') return value
  console.error(`Unknown encoding: ${value}. Use "toon" or "natural".`)
  process.exit(1)
}

async function main() {
  const encoding = parseEncoding()

  const executor: SystemExecutor = {
    type: 'system',
    operation: { name: 'reindex-vectors' },
  }

  const bar = new cliProgress.SingleBar(
    {
      format: ` {bar} {percentage}% | {value}/{total} | failed: {failed} | encoding: ${encoding}`,
      clearOnComplete: false,
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  )

  bar.start(0, 0, { failed: 0 })

  const reindexAllCareerMapVectors = createReindexAllCareerMapVectors(
    (current, total, failed) => {
      bar.setTotal(total)
      bar.update(current, { failed })
    },
    encoding,
  )

  const result = await reindexAllCareerMapVectors(executor)

  bar.stop()

  if (!result.success) {
    console.error('Failed:', result.error.message)
    process.exit(1)
  }

  console.log(`Done: ${result.data.processed} processed, ${result.data.failed} failed (encoding: ${encoding})`)
}

main()
