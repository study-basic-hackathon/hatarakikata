import { mkdirSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'

import type { WriteUserCredentialsCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

const CREDENTIALS_FILE_PATH = 'out/users.md'

export const writeUserCredentialsCommand: WriteUserCredentialsCommand = async (credentials) => {
  try {
    const absolutePath = resolve(CREDENTIALS_FILE_PATH)
    mkdirSync(dirname(absolutePath), { recursive: true })

    const lines = [
      '# インポートユーザー認証情報',
      '',
      '| 名前 | Email | Password |',
      '|------|-------|----------|',
      ...credentials.map((c) => `| ${c.name} | ${c.email} | ${c.password} |`),
      '',
    ]

    writeFileSync(absolutePath, lines.join('\n'), 'utf-8')
    return succeed(undefined)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
