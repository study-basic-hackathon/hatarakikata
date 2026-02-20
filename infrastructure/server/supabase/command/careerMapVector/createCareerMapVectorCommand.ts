import type { CreateCareerMapVectorCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { createSupabaseAdmin } from '../../client'

export const createCareerMapVectorCommand: CreateCareerMapVectorCommand = async (params) => {
  const supabase = createSupabaseAdmin()
  const { error } = await supabase
    .from('career_map_vectors')
    .insert({
      career_map_id: params.careerMapId,
      embedding: params.embedding,
      tag_weights: params.tagWeights,
      updated_at: new Date().toISOString(),
    })

  if (error) return failAsExternalServiceError(error.message, error)

  return succeed(undefined)
}
