import { makeCompareCareerMapEncodings } from '@/core/application/usecase/careerMap/compareCareerMapEncodings'
import { makeGetSimilarCareerMaps } from '@/core/application/usecase/careerMap/getSimilarCareerMaps'
import { makeReadjustAllCareerMapRows } from '@/core/application/usecase/careerMap/readjustAllCareerMapRows'
import { makeReindexAllCareerMapVectors } from '@/core/application/usecase/careerMap/reindexAllCareerMapVectors'
import type { CareerMapVectorEncoding } from '@/core/domain/service/careerMap'
import { createEmbeddingOperation } from '@/infrastructure/server/ai/operation'
import { updateCareerEventCommand, upsertCareerMapVectorCommand } from '@/infrastructure/server/drizzle/command'
import {
  findCareerMapEventTagsByIdsQuery,
  findCareerMapQuery,
  findCareerMapVectorQuery,
  findUserByNameQuery,
  listAllCareerMapIdsQuery,
  listCareerEventsByCareerMapIdQuery,
  listCareerEventsForVectorQuery,
  listCareerMapByUserIdQuery,
  matchCareerMapVectorsQuery,
} from '@/infrastructure/server/drizzle/query'

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

export function createGetSimilarCareerMaps() {
  return makeGetSimilarCareerMaps({
    findCareerMapQuery,
    findCareerMapVectorQuery,
    matchCareerMapVectorsQuery,
    findCareerMapEventTagsByIdsQuery,
    createEmbeddingOperation,
  })
}

export function createCompareCareerMapEncodings(
  onProgress?: (phase: string, current: number, total: number) => void,
) {
  return makeCompareCareerMapEncodings({
    findUserByNameQuery,
    listCareerMapByUserIdQuery,
    listAllCareerMapIdsQuery,
    listCareerEventsForVectorQuery,
    createEmbeddingOperation,
    upsertCareerMapVectorCommand,
    matchCareerMapVectorsQuery,
    onProgress,
  })
}
