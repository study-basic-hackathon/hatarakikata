import 'dotenv/config'

import cliProgress from 'cli-progress'
import { readdirSync } from 'fs'
import inquirer from 'inquirer'
import { resolve } from 'path'

import type { SystemExecutor } from '../core/application/executor'
import { createImportUsers } from './usecase/user'

const CAREER_MAP_DIR = 'data/people/data/careerMaps'
const isAll = process.argv.includes('--all')

function listCareerMapFiles(): string[] {
  const dir = resolve(CAREER_MAP_DIR)
  return readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .sort()
}

async function selectFiles(files: string[]): Promise<string[]> {
  if (isAll) return files

  const answer = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'files',
      message: 'インポートするファイルを選択してください:',
      choices: files.map((file) => ({ name: file, value: file })),
      validate: (input: string[]) => input.length > 0 ? true : '1つ以上選択してください',
    },
  ])

  return answer.files
}

async function main() {
  const allFiles = listCareerMapFiles()

  if (allFiles.length === 0) {
    console.log(`${CAREER_MAP_DIR} にJSONファイルがありません。`)
    return
  }

  const selectedFiles = await selectFiles(allFiles)
  const filePaths = selectedFiles.map((file) => resolve(CAREER_MAP_DIR, file))

  console.log(`\n${selectedFiles.length} ファイルをインポートします...\n`)

  const executor: SystemExecutor = {
    type: 'system',
    operation: { name: 'import-users' },
  }

  const bar = new cliProgress.SingleBar(
    {
      format: ' {bar} {percentage}% | {value}/{total} | failed: {failed}',
      clearOnComplete: false,
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  )

  bar.start(filePaths.length, 0, { failed: 0 })

  let lastCurrent = 0
  let lastTotal = filePaths.length
  let lastFailed = 0

  const importUsers = createImportUsers(
    (current, total, failed) => {
      lastCurrent = current
      lastTotal = total
      lastFailed = failed
      bar.setTotal(total)
      bar.update(current, { failed })
    },
    (message) => {
      bar.stop()
      console.log(message)
      bar.start(lastTotal, lastCurrent, { failed: lastFailed })
    },
  )

  const result = await importUsers(filePaths, executor)

  bar.stop()

  if (!result.success) {
    console.error('Failed:', result.error.message)
    process.exit(1)
  }

  console.log(`\nDone: ${result.data.imported} imported, ${result.data.failed} failed`)

  if (result.data.imported > 0) {
    console.log('認証情報: out/users.md')
  }
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1) })
