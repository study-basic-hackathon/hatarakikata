import 'dotenv/config'

import { program } from 'commander'
import { eq } from 'drizzle-orm'
import inquirer from 'inquirer'

import type { SystemExecutor } from '../core/application/executor'
import { db } from '../infrastructure/server/drizzle/client'
import { careerMaps } from '../infrastructure/server/drizzle/schema/careerMaps'
import { users } from '../infrastructure/server/drizzle/schema/users'
import { createGetSimilarCareerMaps } from './usecase/careerMap'

program
  .name('career-map:search')
  .description('キャリアマップを類似検索する')
  .option('-m, --mode <mode>', '検索モード (map | text)', )
  .option('-i, --id <id>', '検索対象のキャリアマップID (mode=map)')
  .option('-t, --text <text>', '検索テキスト (mode=text)')
  .option('-l, --limit <limit>', '検索件数', '5')
  .parse()

type Mode = 'map' | 'text'

async function selectMode(opts: { mode?: string }): Promise<Mode> {
  if (opts.mode === 'map' || opts.mode === 'text') return opts.mode
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: '検索モードを選択してください',
      choices: [
        { name: 'キャリアマップから検索', value: 'map' },
        { name: 'テキストから検索', value: 'text' },
      ],
    },
  ])
  return answer.mode
}

async function selectCareerMapId(opts: { id?: string }): Promise<string> {
  if (opts.id) return opts.id

  const rows = await db
    .select({ id: careerMaps.id, userName: users.name })
    .from(careerMaps)
    .leftJoin(users, eq(careerMaps.userId, users.id))

  if (rows.length === 0) {
    console.error('キャリアマップが見つかりません')
    process.exit(1)
  }

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'careerMapId',
      message: 'キャリアマップを選択してください',
      choices: rows.map((row) => ({
        name: `${row.userName ?? '(名前なし)'} (${row.id})`,
        value: row.id,
      })),
    },
  ])
  return answer.careerMapId
}

async function inputText(opts: { text?: string }): Promise<string> {
  if (opts.text) return opts.text

  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'text',
      message: '検索テキストを入力してください',
    },
  ])

  if (!answer.text) {
    console.error('テキストが入力されていません')
    process.exit(1)
  }

  return answer.text
}

async function main() {
  const opts = program.opts<{ mode?: string; id?: string; text?: string; limit: string }>()
  const limit = parseInt(opts.limit, 10)

  const mode = await selectMode(opts)

  const executor: SystemExecutor = {
    type: 'system',
    operation: { name: 'career-map:search' },
  }

  const getSimilarCareerMaps = createGetSimilarCareerMaps()

  let result
  if (mode === 'map') {
    const careerMapId = await selectCareerMapId(opts)
    result = await getSimilarCareerMaps({ mode: 'map', id: careerMapId, limit }, executor)
  } else {
    const text = await inputText(opts)
    result = await getSimilarCareerMaps({ mode: 'text', text, limit }, executor)
  }

  if (!result.success) {
    console.error('検索エラー:', result.error.message)
    process.exit(1)
  }

  if (result.data.items.length === 0) {
    console.log('類似するキャリアマップが見つかりませんでした')
    process.exit(0)
  }

  console.log(`\n類似キャリアマップ (${result.data.items.length}件):\n`)
  for (const match of result.data.items) {
    const name = match.userName ?? '(名前なし)'
    const score = (match.score * 100).toFixed(1)
    console.log(`  ${name} (${match.id}) - 類似度: ${score}%`)
  }
  console.log()

  process.exit(0)
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1) })
