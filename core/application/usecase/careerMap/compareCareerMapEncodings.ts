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
import type { CareerEvent } from "@/core/domain/entity/careerEvent"
import { buildCareerMapVectorData, STAGE_PRESETS, type CareerMapVectorEncoding, type CareerMapVectorFields } from "@/core/domain/service/careerMap"
import { type AppResult, failAsForbiddenError, failAsInvalidParametersError, failAsNotFoundError, succeed } from "@/core/util"

const stageNames = Object.keys(STAGE_PRESETS)

const CompareCareerMapEncodingsParametersSchema = z.object({
  userName: z.string().min(1),
  limit: z.number().int().min(1).max(50).default(5),
  stages: z.array(z.string()).default(stageNames),
  encodings: z.array(z.enum(["toon", "natural"])).min(1).default(["toon", "natural"]),
})

export type CompareCareerMapEncodingsParametersInput = z.input<typeof CompareCareerMapEncodingsParametersSchema>

type SearchResult = {
  careerMapId: string
  userName: string | null
  similarity: number
}

export type QuadrantResult = {
  stage: string
  fields: CareerMapVectorFields
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
  targetEvents: CareerEvent[]
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

    // 対象ユーザーのイベントデータ取得
    const targetEventsResult = await listCareerEventsForVectorQuery(careerMapId)
    if (!targetEventsResult.success) return targetEventsResult
    const targetEvents = targetEventsResult.data

    const encodings: CareerMapVectorEncoding[] = parameters.encodings
    const quadrants: QuadrantResult[] = []

    const stages = parameters.stages
      .filter((s) => s in STAGE_PRESETS)
      .map((s) => ({ name: s, fields: STAGE_PRESETS[s] }))

    const totalCombinations = stages.length * encodings.length * encodings.length
    let completedCombinations = 0

    for (const stage of stages) {
      for (const embedEncoding of encodings) {
        // reindex all with this stage + encoding
        let embedTotalTokens = 0
        let targetEmbedText = ""
        const mapIds = mapIdsResult.data
        const total = mapIds.length

        for (let i = 0; i < mapIds.length; i++) {
          const mapId = mapIds[i]
          const eventsResult = await listCareerEventsForVectorQuery(mapId)
          if (!eventsResult.success) continue

          const { text, tagWeights } = buildCareerMapVectorData(eventsResult.data, embedEncoding, stage.fields)
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

          onProgress?.(`${stage.name}:index:${embedEncoding}`, i + 1, total)
        }

        for (const searchEncoding of encodings) {
          // 検索対象のエンベディング生成
          const eventsResult = await listCareerEventsForVectorQuery(careerMapId)
          if (!eventsResult.success) continue

          const { text } = buildCareerMapVectorData(eventsResult.data, searchEncoding, stage.fields)
          const searchEmbResult = await createEmbeddingOperation({ text })
          if (!searchEmbResult.success) continue

          const matchResult = await matchCareerMapVectorsQuery({
            embedding: searchEmbResult.data,
            matchCount: parameters.limit,
            excludeCareerMapId: careerMapId,
          })
          if (!matchResult.success) continue

          completedCombinations++

          quadrants.push({
            stage: stage.name,
            fields: stage.fields,
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

          onProgress?.(`${stage.name}:search:${embedEncoding}×${searchEncoding}`, completedCombinations, totalCombinations)
        }
      }
    }

    return succeed({ quadrants, targetEvents })
  }
}
