import { makeReindexAllCareerMapVectors } from '@/core/application/usecase/careerMap/reindexAllCareerMapVectors'
import { createEmbeddingOperation } from '@/infrastructure/server/ai/operation'
import { upsertCareerMapVectorCommand } from '@/infrastructure/server/supabase/command'
import { listAllCareerMapIdsQuery, listCareerEventsForVectorQuery } from '@/infrastructure/server/supabase/query'

export const reindexAllCareerMapVectors = makeReindexAllCareerMapVectors({
  listAllCareerMapIdsQuery,
  listCareerEventsForVectorQuery,
  createEmbeddingOperation,
  upsertCareerMapVectorCommand,
})
