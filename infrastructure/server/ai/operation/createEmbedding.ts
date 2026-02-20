import type { CreateEmbeddingOperation } from '@/core/application/port/operation'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { createOpenAIClient } from '../client'

export const createEmbeddingOperation: CreateEmbeddingOperation = async (parameters) => {
  try {
    const client = createOpenAIClient()
    const response = await client.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
      input: parameters.text,
    })
    const embedding = response.data[0]?.embedding
    if (!embedding) return failAsExternalServiceError('OpenAI returned empty embedding')

    return succeed(embedding)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
