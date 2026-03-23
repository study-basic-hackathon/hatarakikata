import 'dotenv/config'

import { eq } from 'drizzle-orm'
import * as fs from 'fs'
import inquirer from 'inquirer'
import * as path from 'path'

import { db } from '../infrastructure/server/drizzle/client'
import { users } from '../infrastructure/server/drizzle/schema'
import { createSupabaseAdmin } from '../infrastructure/server/supabase/client'

const isAll = process.argv.includes('--all')

async function main() {
  const userRows = await db.select({ id: users.id, name: users.name }).from(users)

  if (userRows.length === 0) {
    console.log('削除対象のユーザーがいません。')
    return
  }

  let targetUsers: typeof userRows

  if (isAll) {
    targetUsers = userRows
  } else {
    const answer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'userIds',
        message: '削除するユーザーを選択してください:',
        choices: userRows.map((u) => ({ name: u.name ?? u.id, value: u.id })),
        validate: (input: string[]) => input.length > 0 ? true : '1つ以上選択してください',
      },
    ])
    targetUsers = userRows.filter((u) => answer.userIds.includes(u.id))
  }

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `${targetUsers.length}人のユーザーとその関連データを削除します。よろしいですか？`,
      default: false,
    },
  ])

  if (!confirm) {
    console.log('キャンセルしました。')
    return
  }

  const supabase = createSupabaseAdmin()
  let successCount = 0
  let failCount = 0

  for (const user of targetUsers) {
    try {
      // Delete from users table (cascades to career_maps, career_events, etc.)
      await db.delete(users).where(eq(users.id, user.id))

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id)

      if (authError) {
        console.error(`  [警告] ${user.name}: 認証ユーザー削除エラー - ${authError.message}`)
      }

      console.log(`  [成功] ${user.name}`)
      successCount++
    } catch (err) {
      console.error(`  [失敗] ${user.name}: ${err}`)
      failCount++
    }
  }

  console.log(`\n=== 削除結果 ===`)
  console.log(`成功: ${successCount} / 失敗: ${failCount}`)

  // Delete credentials file if it exists
  const credentialsPath = path.resolve(process.cwd(), 'out/users.md')
  if (fs.existsSync(credentialsPath)) {
    fs.unlinkSync(credentialsPath)
    console.log(`\n認証情報ファイルを削除しました: ${credentialsPath}`)
  }
}

main()
