import type { CareerEvent } from "@/core/domain"

import { formatEvents } from "../../converter"

export function buildPrompt(
  input: string,
  careerMapStartDate: string,
  currentEvents: CareerEvent[],
  tags: Array<{ id: string; name: string }>
): string {
  const tagList = tags.map((t) => `- ${t.id} | ${t.name}`).join("\n") || "(no tags)"

  return [
    "You are an assistant that generates career events.",
    "Return ONLY JSON that matches this TypeScript type:",
    "{",
    "  events: Array<{",
    "    name: string,",
    "    startDate: string,",
    "    endDate: string,",
    "    tags?: string[],",
    "    strength?: number,",
    "    row?: number,",
    "    description?: string | null",
    "  }>,",
    "  nextQuestion: { content: string } | null",
    "}",
    "Constraints:",
    "- startDate/endDate must be YYYY-MM-01 format.",
    "- If unsure, pick a reasonable single-month event.",
    "- Avoid duplicating existing events.",
    "- Always return at least one event in events array.",
    "- For tags, use ONLY tag IDs from the list below. Do not invent tags.",
    "- The input is Japanese; interpret it as Japanese text.",
    "Input:",
    input,
    "Career map start date:",
    careerMapStartDate,
    "Available tags (id | name):",
    tagList,
    "Current events:",
    formatEvents(currentEvents),
  ].join("\n")
}
