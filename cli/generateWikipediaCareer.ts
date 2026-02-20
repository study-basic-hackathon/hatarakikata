import 'dotenv/config'

import inquirer from 'inquirer'

import type { SystemExecutor } from '../core/application/executor'
import { generateCareerFromWikipedia } from './usecase'

async function main() {
  const { personName, language } = await inquirer.prompt([
    {
      type: 'input',
      name: 'personName',
      message: '人物名を入力してください:',
      validate: (input: string) => input.trim() ? true : '人物名を入力してください',
    },
    {
      type: 'input',
      name: 'language',
      message: 'Wikipedia言語コード:',
      default: 'ja',
    },
  ])

  try {

    console.log(`\n${personName} のWikipediaページからキャリアデータを生成します...`)

    const executor: SystemExecutor = {
      type: 'system',
      operation: { name: 'generate-wikipedia-career' },
    }

    const result = await generateCareerFromWikipedia({ personName, language }, executor)

    if (!result.success) {
      console.error('Failed:', result.error.type, result.error.message)
      process.exit(1)
    }

    console.log('\n=== 生成完了 ===')
    console.log(`人物名: ${result.data.personName}`)
    console.log(`Wikipedia URL: ${result.data.wikipediaUrl}`)
    console.log(`推定生年月日: ${result.data.birthDate ?? '不明'}`)
    console.log(`イベント数: ${result.data.events.length}`)
    console.log('\nイベント一覧:')
    for (const event of result.data.events) {
      console.log(`  - ${event.name} (${event.type}) ${event.startDate} ~ ${event.endDate}`)
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

main()
