import { NextRequest } from 'next/server'

import { buildCareerMapVectorData, fetchCareerMapEventsForVector } from '@/api/lib/careerMapVector'
import { toResponse } from '@/api/lib/response'
import { failAsExternalServiceError, failAsForbiddenError, succeed } from '@/core/util/appResult'
import { createOpenAIClient } from '@/infrastructure/server/ai/client'
import { createSupabaseAdmin } from '@/infrastructure/server/supabase/client'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ') && authHeader.slice(7) === secret) {
    return true
  }

  const headerSecret = request.headers.get('x-cron-secret')
  return headerSecret === secret
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return toResponse(failAsForbiddenError('Forbidden'))
  }

  const supabase = createSupabaseAdmin()
  const { data: maps, error: mapError } = await supabase
    .from('career_maps')
    .select('id')

  if (mapError) return toResponse(failAsExternalServiceError(mapError.message))

  let processed = 0
  let failed = 0

  for (const map of maps ?? []) {
    try {
      const events = await fetchCareerMapEventsForVector(supabase, map.id)
      const { text, tagWeights } = buildCareerMapVectorData(events)
      const client = createOpenAIClient()
      const embeddingResponse = await client.embeddings.create({
        model: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
        input: text,
      })
      const embedding = embeddingResponse.data[0]?.embedding
      if (!embedding) throw new Error('OpenAI returned empty embedding')

      const payload = {
        career_map_id: map.id,
        embedding,
        tag_weights: tagWeights,
        updated_at: new Date().toISOString(),
      }

      const { error: upsertError } = await supabase
        .from('career_map_vectors')
        .upsert(payload, { onConflict: 'career_map_id' })

      if (upsertError) throw new Error(upsertError.message)
      processed += 1
    } catch (error) {
      failed += 1
      // continue to next map
      const message = error instanceof Error ? error.message : String(error)
      console.warn(`[vector] failed for map ${map.id}: ${message}`)
    }
  }

  return toResponse(succeed({ processed, failed }))
}
