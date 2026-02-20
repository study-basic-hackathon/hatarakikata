import type { GenerateCareerEventsFromBiographyOperation } from "@/core/application/port/operation/generateCareerEventsFromBiography"
import type { GenerateCareerEventsResult } from "@/core/domain"
import { failAsExternalServiceError, succeed } from "@/core/util/appResult"

import { createOpenAIClient } from "../../client"
import { normalizeActions } from "../../converter"
import { buildBiographyPrompt } from "./prompt"

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-nano"

export const generateCareerEventsFromBiography: GenerateCareerEventsFromBiographyOperation = async (parameters) => {
  const today = new Date().toISOString().slice(0, 10)
  const fallbackDate = parameters.birthDate ?? today

  const prompt = buildBiographyPrompt(
    parameters.personName,
    parameters.biographyMarkdown,
    parameters.birthDate,
    parameters.tags
  )

  const client = createOpenAIClient()

  try {
    const response = await client.responses.create({
      model: MODEL,
      input: prompt,
      text: { format: { type: "json_object" } },
    })

    const text = response.output_text
    if (!text) return failAsExternalServiceError("OpenAI returned empty response")

    const parsed = JSON.parse(text) as GenerateCareerEventsResult
    const actions = normalizeActions(parsed.actions ?? [], fallbackDate, parameters.tags)

    return succeed({ actions, nextQuestion: null })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
