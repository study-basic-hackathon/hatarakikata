import type { CareerMapVectorEncoding } from '@/core/domain/service/careerMap'
import { makeReadjustAllCareerMapRows } from '@/core/application/usecase/careerMap/readjustAllCareerMapRows'
import { makeReindexAllCareerMapVectors } from '@/core/application/usecase/careerMap/reindexAllCareerMapVectors'
import { createEmbeddingOperation } from '@/infrastructure/server/ai/operation'
import { updateCareerEventCommand, upsertCareerMapVectorCommand } from '@/infrastructure/server/drizzle/command'
import { listAllCareerMapIdsQuery, listCareerEventsByCareerMapIdQuery, listCareerEventsForVectorQuery } from '@/infrastructure/server/drizzle/query'

export function createReadjustAllCareerMapRows(
  onProgress?: (current: number, total: number, failed: number) => void
) {
  return makeReadjustAllCareerMapRows({
    listAllCareerMapIdsQuery,
    listCareerEventsByCareerMapIdQuery,
    updateCareerEventCommand,
    onProgress,
  })
}

export function createReindexAllCareerMapVectors(
  onProgress?: (current: number, total: number, failed: number) => void,
  encoding?: CareerMapVectorEncoding,
) {
  return makeReindexAllCareerMapVectors({
    listAllCareerMapIdsQuery,
    listCareerEventsForVectorQuery,
    createEmbeddingOperation,
    upsertCareerMapVectorCommand,
    encoding,
    onProgress,
  })
}
