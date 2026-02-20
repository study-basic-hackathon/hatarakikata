import { encode } from "@toon-format/toon"

import type { CareerEvent } from "@/core/domain/entity/careerEvent"
import type { CareerMapVectorData } from "@/core/domain/value/careerMapVector"

export function buildCareerMapVectorData(events: CareerEvent[]): CareerMapVectorData {
  const tagWeights: Record<string, number> = {}

  const rows = events.map((event) => {
    const tagNames: string[] = []
    for (const tag of event.tags) {
      tagNames.push(tag.name)
      tagWeights[tag.id] = (tagWeights[tag.id] ?? 0) + event.strength
    }

    return {
      name: event.name,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      strength: event.strength,
      tags: tagNames.join(', ') || '-',
      description: event.description?.replace(/\s+/g, ' ') || '-',
    }
  })

  const text = rows.length ? encode({ events: rows }) : 'No events'
  return { text, tagWeights }
}
