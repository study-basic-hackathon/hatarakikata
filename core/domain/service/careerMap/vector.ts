import { encode } from "@toon-format/toon"

import type { CareerEvent } from "@/core/domain/entity/careerEvent"
import type { CareerMapVectorData } from "@/core/domain/value/careerMapVector"

export type CareerMapVectorEncoding = "toon" | "natural"

function computeTagWeights(events: CareerEvent[]): Record<string, number> {
  const tagWeights: Record<string, number> = {}
  for (const event of events) {
    for (const tag of event.tags) {
      tagWeights[tag.id] = (tagWeights[tag.id] ?? 0) + event.strength
    }
  }
  return tagWeights
}

function buildToonText(events: CareerEvent[]): string {
  const rows = events.map((event) => ({
    name: event.name,
    type: event.type,
    startDate: event.startDate,
    endDate: event.endDate,
    strength: event.strength,
    tags: event.tags.map((t) => t.name).join(', ') || '-',
    description: event.description?.replace(/\s+/g, ' ') || '-',
  }))
  return rows.length ? encode({ events: rows }) : 'No events'
}

function buildNaturalText(events: CareerEvent[]): string {
  if (events.length === 0) return 'No events'

  return events
    .map((event) => {
      const description = event.description?.replace(/\s+/g, ' ') ?? ''
      return `${event.name}。${description}`
    })
    .join('\n')
}

export function buildCareerMapVectorData(
  events: CareerEvent[],
  encoding: CareerMapVectorEncoding = "toon",
): CareerMapVectorData {
  const tagWeights = computeTagWeights(events)
  const text = encoding === "natural"
    ? buildNaturalText(events)
    : buildToonText(events)
  return { text, tagWeights }
}
