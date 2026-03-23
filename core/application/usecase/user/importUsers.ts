import { randomBytes, randomUUID } from "crypto"

import type { Executor } from "@/core/application/executor"
import type {
  CreateAuthUserCommand,
  CreateCareerEventCommand,
  CreateCareerMapCommand,
  CreateCreditTransactionCommand,
  CreateMembershipCommand,
  CreateUserCommand,
  DeleteAuthUserByEmailCommand,
  DeleteUserCommand,
  WriteUserCredentialsCommand,
} from "@/core/application/port/command"
import type {
  FindUserByNameQuery,
  ListCareerMapEventTagsQuery,
  ReadCareerMapSnapshotQuery,
} from "@/core/application/port/query"
import type { PlacedItem } from "@/core/domain/service/careerMap/row"
import { findNonOverlappingRow } from "@/core/domain/service/careerMap/row"
import type { CareerMapSnapshotEvent } from "@/core/domain/value/careerMapSnapshot"
import { type AppResult, failAsForbiddenError, succeed } from "@/core/util"

type ImportUsersResult = {
  imported: number
  failed: number
}

export type ImportUsersUsecase = (
  filePaths: string[],
  executor: Executor,
) => Promise<AppResult<ImportUsersResult>>

export type MakeImportUsersDependencies = {
  readCareerMapSnapshotQuery: ReadCareerMapSnapshotQuery
  writeUserCredentialsCommand: WriteUserCredentialsCommand
  findUserByNameQuery: FindUserByNameQuery
  deleteUserCommand: DeleteUserCommand
  deleteAuthUserByEmailCommand: DeleteAuthUserByEmailCommand
  createAuthUserCommand: CreateAuthUserCommand
  createUserCommand: CreateUserCommand
  createMembershipCommand: CreateMembershipCommand
  createCreditTransactionCommand: CreateCreditTransactionCommand
  createCareerMapCommand: CreateCareerMapCommand
  createCareerEventCommand: CreateCareerEventCommand
  listCareerMapEventTagsQuery: ListCareerMapEventTagsQuery
  onProgress?: (current: number, total: number, failed: number) => void
  onLog?: (message: string) => void
}

function generateEmail(): string {
  return `${randomUUID()}@example.com`
}

function generatePassword(): string {
  return randomBytes(12).toString('base64url')
}

function sortEventsForRowCalculation(events: CareerMapSnapshotEvent[]): CareerMapSnapshotEvent[] {
  return [...events].sort((a, b) => {
    const dateCompare = a.startDate.localeCompare(b.startDate)
    if (dateCompare !== 0) return dateCompare
    return b.strength - a.strength
  })
}

export function makeImportUsers({
  readCareerMapSnapshotQuery,
  writeUserCredentialsCommand,
  findUserByNameQuery,
  deleteUserCommand,
  deleteAuthUserByEmailCommand,
  createAuthUserCommand,
  createUserCommand,
  createMembershipCommand,
  createCreditTransactionCommand,
  createCareerMapCommand,
  createCareerEventCommand,
  listCareerMapEventTagsQuery,
  onProgress,
  onLog,
}: MakeImportUsersDependencies): ImportUsersUsecase {
  return async (filePaths, executor) => {
    if (executor.type !== "system") {
      return failAsForbiddenError("Forbidden")
    }

    // タグ名→ID変換マップを事前取得
    const tagsResult = await listCareerMapEventTagsQuery()
    if (!tagsResult.success) return tagsResult
    const tagIdByName = new Map(tagsResult.data.items.map((t) => [t.name, t.id]))

    const total = filePaths.length
    let imported = 0
    let failed = 0
    const credentials: { name: string; email: string; password: string }[] = []

    for (const filePath of filePaths) {
      try {
        // 1. スナップショット読み込み
        const snapshotResult = await readCareerMapSnapshotQuery(filePath)
        if (!snapshotResult.success) throw new Error(snapshotResult.error.message)
        const snapshot = snapshotResult.data

        const email = generateEmail()

        // 2. 既存ユーザーの確認と削除
        const existingUserResult = await findUserByNameQuery(snapshot.personName)
        if (!existingUserResult.success) throw new Error(existingUserResult.error.message)

        if (existingUserResult.data) {
          onLog?.(`[削除] 既存ユーザー "${snapshot.personName}" を削除します`)
          // DB削除（CASCADE で関連データも削除）
          const deleteResult = await deleteUserCommand({ id: existingUserResult.data.id })
          if (!deleteResult.success) throw new Error(deleteResult.error.message)
          // Auth削除
          await deleteAuthUserByEmailCommand({ email })
        }

        // 3. Auth ユーザー作成
        const password = generatePassword()
        const authResult = await createAuthUserCommand({ email, password })
        if (!authResult.success) throw new Error(authResult.error.message)
        const userId = authResult.data.id

        // 4. DB ユーザー作成
        const userResult = await createUserCommand({ id: userId, name: snapshot.personName })
        if (!userResult.success) throw new Error(userResult.error.message)

        // 5. Membership 作成
        const membershipResult = await createMembershipCommand({ userId, plan: 'free' })
        if (!membershipResult.success) throw new Error(membershipResult.error.message)

        // 6. Credit 付与
        const creditResult = await createCreditTransactionCommand({ userId, amount: 100, type: 'grant' })
        if (!creditResult.success) throw new Error(creditResult.error.message)

        // 7. CareerMap 作成
        const earliestDate = snapshot.events.length > 0
          ? snapshot.events.reduce((min, e) => e.startDate < min ? e.startDate : min, snapshot.events[0].startDate)
          : null
        const mapResult = await createCareerMapCommand({ userId, startDate: earliestDate })
        if (!mapResult.success) throw new Error(mapResult.error.message)
        const careerMapId = mapResult.data.id

        // 8. CareerEvents 作成（row自動計算）
        const sortedEvents = sortEventsForRowCalculation(snapshot.events)
        const placedItems: PlacedItem[] = []

        for (const event of sortedEvents) {
          const tagIds = event.tagNames
            .map((name) => tagIdByName.get(name))
            .filter((id): id is string => id !== undefined)

          const row = findNonOverlappingRow(placedItems, {
            startDate: event.startDate,
            endDate: event.endDate,
            strength: event.strength,
          })

          const eventResult = await createCareerEventCommand({
            careerMapId,
            name: event.name,
            type: event.type,
            startDate: event.startDate,
            endDate: event.endDate,
            strength: event.strength,
            row,
            description: event.description,
            tags: tagIds,
          })
          if (!eventResult.success) throw new Error(eventResult.error.message)

          placedItems.push({
            startDate: event.startDate,
            endDate: event.endDate,
            strength: event.strength,
            row,
          })
        }

        credentials.push({ name: snapshot.personName, email, password })
        imported++
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        onLog?.(`[失敗] ${filePath}: ${message}`)
        failed++
      }
      onProgress?.(imported + failed, total, failed)
    }

    // 認証情報をファイルに書き出し
    if (credentials.length > 0) {
      const writeResult = await writeUserCredentialsCommand(credentials)
      if (!writeResult.success) {
        console.error(`認証情報ファイルの書き出しに失敗: ${writeResult.error.message}`)
      }
    }

    return succeed({ imported, failed })
  }
}
