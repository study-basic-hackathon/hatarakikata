import { sql } from 'drizzle-orm'

import type { MatchCareerMapVectorsQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'

export const matchCareerMapVectorsQuery: MatchCareerMapVectorsQuery = async (parameters) => {
  try {
    const embeddingStr = `[${parameters.embedding.join(',')}]`
    const rows = await db.execute<{
      career_map_id: string
      similarity: number
      tag_weights: Record<string, number>
      user_name: string | null
    }>(sql`
      SELECT * FROM match_career_map_vectors(
        ${embeddingStr}::vector,
        ${parameters.matchCount},
        ${parameters.excludeCareerMapId}
      )
    `)

    return succeed(rows.map((row) => ({
      careerMapId: row.career_map_id,
      similarity: row.similarity,
      tagWeights: row.tag_weights ?? {},
      userName: row.user_name ?? null,
    })))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
