import type { GenerateCareerEventsOperation } from "@/core/application/port/operation"
import type { GenerateCareerEventsResult } from "@/core/domain"
import { failAsExternalServiceError, succeed } from "@/core/util/appResult"

import { createOpenAIClient } from "../../client"
import { normalizeEvents } from "../../converter"
import { buildPrompt } from "./prompt"

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-nano"

export const generateCareerEvents: GenerateCareerEventsOperation = async (parameters) => {
  const today = new Date().toISOString().slice(0, 10)
  const fallbackDate = parameters.map.startDate ?? today

  try {
    const prompt = buildPrompt(
      parameters.question,
      parameters.map.startDate ?? "",
      parameters.content,
      parameters.tags
    )

    const client = createOpenAIClient()
    const response = await client.responses.create({
      model: MODEL,
      input: prompt,
      text: { format: { type: "json_object" } },
    })

    const text = response.output_text
    if (!text) return failAsExternalServiceError("OpenAI returned empty response")

    const parsed = JSON.parse(text) as GenerateCareerEventsResult
    const events = normalizeEvents(parsed.events ?? [], fallbackDate, parameters.tags)
    const nextQuestion = parsed.nextQuestion ? { content: parsed.nextQuestion.content } : null

    return succeed({ events, nextQuestion })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
