import type { UpdateCareerMapVectorCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { createSupabaseAdmin } from '../../client'

export const updateCareerMapVectorCommand: UpdateCareerMapVectorCommand = async (params) => {
  const supabase = createSupabaseAdmin()
  const { error } = await supabase
    .from('career_map_vectors')
    .update({
      embedding: params.embedding,
      tag_weights: params.tagWeights,
      updated_at: new Date().toISOString(),
    })
    .eq('career_map_id', params.careerMapId)

  if (error) return failAsExternalServiceError(error.message, error)

  return succeed(undefined)
}
