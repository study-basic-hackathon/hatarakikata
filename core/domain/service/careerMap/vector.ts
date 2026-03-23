import { encode } from "@toon-format/toon"

import type { CareerEvent } from "@/core/domain/entity/careerEvent"
import type { CareerMapVectorData } from "@/core/domain/value/careerMapVector"

export type CareerMapVectorEncoding = "toon" | "natural"

export type CareerMapVectorFields = {
  name?: boolean
  type?: boolean
  tags?: boolean
  strength?: boolean
  description?: boolean
  dates?: boolean
}

const NO_FIELDS: Required<CareerMapVectorFields> = {
  name: false,
  type: false,
  tags: false,
  strength: false,
  description: false,
  dates: false,
}

const ALL_FIELDS: Required<CareerMapVectorFields> = {
  name: true,
  type: true,
  tags: true,
  strength: true,
  description: true,
  dates: true,
}

export const STAGE_PRESETS: Record<string, CareerMapVectorFields> = {
  stage1: { name: true, type: true },
  stage2: { name: true, type: true, tags: true, strength: true },
  stage3: { name: true, type: true, tags: true, strength: true, description: true, dates: true },
}

function computeTagWeights(events: CareerEvent[]): Record<string, number> {
  const tagWeights: Record<string, number> = {}
  for (const event of events) {
    for (const tag of event.tags) {
      tagWeights[tag.id] = (tagWeights[tag.id] ?? 0) + event.strength
    }
  }
  return tagWeights
}

function buildToonText(events: CareerEvent[], fields: Required<CareerMapVectorFields>): string {
  const rows = events.map((event) => {
    const row: Record<string, unknown> = {}
    if (fields.name) row.name = event.name
    if (fields.type) row.type = event.type
    if (fields.dates) {
      row.startDate = event.startDate
      row.endDate = event.endDate
    }
    if (fields.strength) row.strength = event.strength
    if (fields.tags) row.tags = event.tags.map((t) => t.name).join(', ') || '-'
    if (fields.description) row.description = event.description?.replace(/\s+/g, ' ') || '-'
    return row
  })
  return rows.length ? encode({ events: rows }) : 'No events'
}

function buildNaturalText(events: CareerEvent[], fields: Required<CareerMapVectorFields>): string {
  if (events.length === 0) return 'No events'

  return events
    .map((event) => {
      const parts: string[] = []
      if (fields.name) parts.push(event.name)
      if (fields.type) parts.push(`(${event.type})`)
      if (fields.dates) parts.push(`${event.startDate}〜${event.endDate}`)
      if (fields.strength) parts.push(`強度:${event.strength}`)
      if (fields.tags && event.tags.length > 0) parts.push(`[${event.tags.map((t) => t.name).join(', ')}]`)
      if (fields.description && event.description) parts.push(event.description.replace(/\s+/g, ' '))
      return parts.join('。')
    })
    .join('\n')
}

export function buildCareerMapVectorData(
  events: CareerEvent[],
  encoding: CareerMapVectorEncoding = "toon",
  fields?: CareerMapVectorFields,
): CareerMapVectorData {
  const resolvedFields: Required<CareerMapVectorFields> = fields ? { ...NO_FIELDS, ...fields } : ALL_FIELDS
  const tagWeights = computeTagWeights(events)
  const text = encoding === "natural"
    ? buildNaturalText(events, resolvedFields)
    : buildToonText(events, resolvedFields)
  return { text, tagWeights }
}
