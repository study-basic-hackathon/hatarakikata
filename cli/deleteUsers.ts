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
  const supabase = createSupabaseAdmin()
  const userRows = await db.select({ id: users.id, name: users.name }).from(users)

  let targetUsers: typeof userRows

  if (isAll) {
    targetUsers = userRows
  } else {
    if (userRows.length === 0) {
      console.log('削除対象のユーザーがいません。')
      return
    }

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
  }

  let successCount = 0
  let failCount = 0

  // DB ユーザーを削除
  for (const user of targetUsers) {
    try {
      await db.delete(users).where(eq(users.id, user.id))
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

  // --all: DB に存在しない Auth ユーザーも削除
  if (isAll) {
    const dbUserIds = new Set(userRows.map((u) => u.id))
    const { data, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      console.error(`  [警告] Auth ユーザー一覧取得エラー: ${listError.message}`)
    } else {
      const orphanAuthUsers = data.users.filter((u) => !dbUserIds.has(u.id))
      for (const authUser of orphanAuthUsers) {
        try {
          const { error } = await supabase.auth.admin.deleteUser(authUser.id)
          if (error) {
            console.error(`  [警告] Auth ${authUser.email ?? authUser.id}: ${error.message}`)
            failCount++
          } else {
            console.log(`  [成功] Auth ${authUser.email ?? authUser.id}`)
            successCount++
          }
        } catch (err) {
          console.error(`  [失敗] Auth ${authUser.email ?? authUser.id}: ${err}`)
          failCount++
        }
      }
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

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1) })
