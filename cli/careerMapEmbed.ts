import 'dotenv/config'

import cliProgress from 'cli-progress'
import { program } from 'commander'
import inquirer from 'inquirer'

import type { SystemExecutor } from '../core/application/executor'
import type { CareerMapVectorEncoding } from '../core/domain/service/careerMap'
import { createReindexAllCareerMapVectors } from './usecase/careerMap'

program
  .name('career-map:embed')
  .description('キャリアマップのベクトルを再インデックスする')
  .option('-e, --encoding <encoding>', 'エンコーディング形式 (natural | toon)')
  .parse()

async function main() {
  const opts = program.opts<{ encoding?: string }>()

  let encoding: CareerMapVectorEncoding
  if (opts.encoding === 'natural' || opts.encoding === 'toon') {
    encoding = opts.encoding
  } else {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'encoding',
        message: 'エンコーディング形式を選択してください',
        choices: [
          { name: 'TOON形式', value: 'toon' },
          { name: '自然言語', value: 'natural' },
        ],
      },
    ])
    encoding = answer.encoding
  }

  const executor: SystemExecutor = {
    type: 'system',
    operation: { name: 'career-map:embed' },
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
