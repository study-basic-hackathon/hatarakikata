import { z } from "zod"

import type { Executor } from "@/core/application/executor"
import type {
  CreateEmbeddingOperation,
  FindUserByNameQuery,
  ListAllCareerMapIdsQuery,
  ListCareerEventsForVectorQuery,
  ListCareerMapByUserIdQuery,
  MatchCareerMapVectorsQuery,
  UpsertCareerMapVectorCommand,
} from "@/core/application/port"
import { buildCareerMapVectorData, type CareerMapVectorEncoding } from "@/core/domain/service/careerMap"
import { type AppResult, failAsForbiddenError, failAsInvalidParametersError, failAsNotFoundError, succeed } from "@/core/util"

const CompareCareerMapEncodingsParametersSchema = z.object({
  userName: z.string().min(1),
  limit: z.number().int().min(1).max(50).default(5),
})

export type CompareCareerMapEncodingsParametersInput = z.input<typeof CompareCareerMapEncodingsParametersSchema>

type SearchResult = {
  careerMapId: string
  userName: string | null
  similarity: number
}

export type QuadrantResult = {
  embedEncoding: CareerMapVectorEncoding
  searchEncoding: CareerMapVectorEncoding
  embedTokens: number
  searchTokens: number
  totalTokens: number
  embedTextLength: number
  searchTextLength: number
  embedText: string
  searchText: string
  results: SearchResult[]
}

type CompareCareerMapEncodingsResult = {
  quadrants: QuadrantResult[]
}

export type CompareCareerMapEncodingsUsecase = (
  input: CompareCareerMapEncodingsParametersInput,
  executor: Executor
) => Promise<AppResult<CompareCareerMapEncodingsResult>>

export type MakeCompareCareerMapEncodingsDependencies = {
  findUserByNameQuery: FindUserByNameQuery
  listCareerMapByUserIdQuery: ListCareerMapByUserIdQuery
  listAllCareerMapIdsQuery: ListAllCareerMapIdsQuery
  listCareerEventsForVectorQuery: ListCareerEventsForVectorQuery
  createEmbeddingOperation: CreateEmbeddingOperation
  upsertCareerMapVectorCommand: UpsertCareerMapVectorCommand
  matchCareerMapVectorsQuery: MatchCareerMapVectorsQuery
  onProgress?: (phase: string, current: number, total: number) => void
}

export function makeCompareCareerMapEncodings({
  findUserByNameQuery,
  listCareerMapByUserIdQuery,
  listAllCareerMapIdsQuery,
  listCareerEventsForVectorQuery,
  createEmbeddingOperation,
  upsertCareerMapVectorCommand,
  matchCareerMapVectorsQuery,
  onProgress,
}: MakeCompareCareerMapEncodingsDependencies): CompareCareerMapEncodingsUsecase {
  return async (input, executor) => {
    const validation = CompareCareerMapEncodingsParametersSchema.safeParse(input)
    if (!validation.success) return failAsInvalidParametersError(validation.error.message, validation.error)

    if (executor.type !== "system") {
      return failAsForbiddenError("Forbidden")
    }

    const parameters = validation.data

    // ユーザー検索
    const userResult = await findUserByNameQuery(parameters.userName)
    if (!userResult.success) return userResult
    if (!userResult.data) return failAsNotFoundError(`User "${parameters.userName}" is not found`)

    // キャリアマップ取得
    const mapsResult = await listCareerMapByUserIdQuery({ userId: userResult.data.id })
    if (!mapsResult.success) return mapsResult
    if (mapsResult.data.items.length === 0) return failAsNotFoundError("Career map is not found")

    const careerMapId = mapsResult.data.items[0].id

    // 全マップID取得
    const mapIdsResult = await listAllCareerMapIdsQuery()
    if (!mapIdsResult.success) return mapIdsResult

    const encodings: CareerMapVectorEncoding[] = ["toon", "natural"]
    const quadrants: QuadrantResult[] = []

    for (const embedEncoding of encodings) {
      // reindex all with this encoding
      let embedTotalTokens = 0
      let targetEmbedText = ""
      const mapIds = mapIdsResult.data
      const total = mapIds.length

      for (let i = 0; i < mapIds.length; i++) {
        const mapId = mapIds[i]
        const eventsResult = await listCareerEventsForVectorQuery(mapId)
        if (!eventsResult.success) continue

        const { text, tagWeights } = buildCareerMapVectorData(eventsResult.data, embedEncoding)
        const embResult = await createEmbeddingOperation({ text })
        if (!embResult.success) continue

        if (mapId === careerMapId) {
          targetEmbedText = text
        }

        embedTotalTokens += text.length
        await upsertCareerMapVectorCommand({
          careerMapId: mapId,
          embedding: embResult.data,
          tagWeights,
        })

        onProgress?.(`index:${embedEncoding}`, i + 1, total)
      }

      for (const searchEncoding of encodings) {
        // 検索対象のエンベディング生成
        const eventsResult = await listCareerEventsForVectorQuery(careerMapId)
        if (!eventsResult.success) continue

        const { text } = buildCareerMapVectorData(eventsResult.data, searchEncoding)
        const searchEmbResult = await createEmbeddingOperation({ text })
        if (!searchEmbResult.success) continue

        const matchResult = await matchCareerMapVectorsQuery({
          embedding: searchEmbResult.data,
          matchCount: parameters.limit,
          excludeCareerMapId: careerMapId,
        })
        if (!matchResult.success) continue

        quadrants.push({
          embedEncoding,
          searchEncoding,
          embedTokens: embedTotalTokens,
          searchTokens: text.length,
          totalTokens: embedTotalTokens + text.length,
          embedTextLength: targetEmbedText.length,
          searchTextLength: text.length,
          embedText: targetEmbedText,
          searchText: text,
          results: matchResult.data.map((m) => ({
            careerMapId: m.careerMapId,
            userName: m.userName,
            similarity: m.similarity,
          })),
        })

        onProgress?.(`search:${embedEncoding}×${searchEncoding}`, quadrants.length, encodings.length * encodings.length)
      }
    }

    return succeed({ quadrants })
  }
}
