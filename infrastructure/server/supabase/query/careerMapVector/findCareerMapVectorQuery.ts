import type { FindCareerMapVectorQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { createSupabaseAdmin } from '../../client'
import type { CareerMapVectorRow } from '../../schemas'

function parseEmbedding(raw: string): number[] {
  return raw.replace(/^\[|\]$/g, '').split(',').map(Number)
}

export const findCareerMapVectorQuery: FindCareerMapVectorQuery = async (careerMapId) => {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('career_map_vectors')
    .select('career_map_id, embedding, tag_weights')
    .eq('career_map_id', careerMapId)
    .maybeSingle()

  if (error) return failAsExternalServiceError(error.message, error)
  if (!data) return succeed(null)

  const row = data as unknown as CareerMapVectorRow
  return succeed({
    careerMapId: row.career_map_id,
    embedding: parseEmbedding(row.embedding),
    tagWeights: row.tag_weights ?? {},
  })
}
