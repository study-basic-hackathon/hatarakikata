import { NextRequest } from 'next/server'

import { buildCareerMapVectorData, fetchCareerMapEventsForVector } from '@/api/lib/careerMapVector'
import { toResponse } from '@/api/lib/response'
import { getExecutor } from '@/api/service/auth'
import { failAsExternalServiceError, failAsForbiddenError, failAsNotFoundError, succeed } from '@/core/util/appResult'
import { createOpenAIClient } from '@/infrastructure/server/ai/client'
import { createSupabaseAdmin } from '@/infrastructure/server/supabase/client'

type SimilarCareerMap = {
  id: string
  score: number
  overlapTags: { id: string; name: string }[]
}

type VectorRow = {
  career_map_id: string
  embedding: number[]
  tag_weights: Record<string, number>
}

type MatchRow = {
  career_map_id: string
  similarity: number
  tag_weights: Record<string, number> | null
}

function clampLimit(value: string | null) {
  const parsed = Number(value ?? '10')
  if (!Number.isFinite(parsed)) return 10
  return Math.max(1, Math.min(50, Math.floor(parsed)))
}

async function ensureCareerMapVector(careerMapId: string) {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('career_map_vectors')
    .select('career_map_id, embedding, tag_weights')
    .eq('career_map_id', careerMapId)
    .maybeSingle()

  if (error) return { error }
  if (data?.embedding) return { data: data as VectorRow }

  try {
    const events = await fetchCareerMapEventsForVector(supabase, careerMapId)
    const { text, tagWeights } = buildCareerMapVectorData(events)
    const client = createOpenAIClient()
    const embeddingResponse = await client.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
      input: text,
    })
    const embedding = embeddingResponse.data[0]?.embedding
    if (!embedding) return { error: new Error('OpenAI returned empty embedding') }

    const payload = {
      career_map_id: careerMapId,
      embedding,
      tag_weights: tagWeights,
      updated_at: new Date().toISOString(),
    }

    const { data: upserted, error: upsertError } = await supabase
      .from('career_map_vectors')
      .upsert(payload, { onConflict: 'career_map_id' })
      .select('career_map_id, embedding, tag_weights')
      .maybeSingle()

    if (upsertError || !upserted) return { error: upsertError ?? new Error('Failed to upsert vector') }
    return { data: upserted as VectorRow }
  } catch (error) {
    return { error: error instanceof Error ? error : new Error(String(error)) }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const executor = await getExecutor()
  if (executor.type !== 'user' || executor.userType !== 'general') {
    return toResponse(failAsForbiddenError('Forbidden'))
  }

  const { id } = await params
  const limit = clampLimit(new URL(request.url).searchParams.get('limit'))

  const supabase = createSupabaseAdmin()
  const { data: mapExists, error: mapError } = await supabase
    .from('career_maps')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (mapError) return toResponse(failAsExternalServiceError(mapError.message))
  if (!mapExists) return toResponse(failAsNotFoundError('Career map is not found'))

  const ensured = await ensureCareerMapVector(id)
  if (!ensured.data) {
    const message = ensured.error instanceof Error ? ensured.error.message : String(ensured.error)
    return toResponse(failAsExternalServiceError(message))
  }

  const targetWeights = ensured.data.tag_weights ?? {}
  const { data: matches, error: matchError } = await supabase.rpc('match_career_map_vectors', {
    query_embedding: ensured.data.embedding,
    match_count: limit,
    match_id: id,
  })

  if (matchError) return toResponse(failAsExternalServiceError(matchError.message))

  const matchRows = (matches ?? []) as MatchRow[]
  if (matchRows.length === 0) {
    return toResponse(succeed({ items: [], count: 0 }))
  }

  const overlapTagIds = new Set<string>()
  const results: SimilarCareerMap[] = matchRows.map((row) => {
    const otherWeights = row.tag_weights ?? {}
    const overlapScores: { id: string; score: number }[] = []

    for (const [tagId, weight] of Object.entries(targetWeights)) {
      const otherWeight = otherWeights[tagId]
      if (!otherWeight) continue
      overlapScores.push({ id: tagId, score: weight * otherWeight })
    }

    overlapScores.sort((a, b) => b.score - a.score)
    const topOverlap = overlapScores.slice(0, 3).map((entry) => entry.id)
    topOverlap.forEach((tagId) => overlapTagIds.add(tagId))

    return {
      id: row.career_map_id,
      score: row.similarity,
      overlapTags: topOverlap.map((tagId) => ({ id: tagId, name: tagId })),
    }
  })

  const tagIds = Array.from(overlapTagIds)
  if (tagIds.length > 0) {
    const { data: tagRows, error: tagError } = await supabase
      .from('career_map_event_tags')
      .select('id, name')
      .in('id', tagIds)

    if (tagError) return toResponse(failAsExternalServiceError(tagError.message))

    const nameById = new Map((tagRows ?? []).map((tag) => [tag.id, tag.name]))
    for (const result of results) {
      result.overlapTags = result.overlapTags.map((tag) => ({
        id: tag.id,
        name: nameById.get(tag.id) ?? tag.id,
      }))
    }
  }

  return toResponse(succeed({ items: results, count: results.length }))
}
