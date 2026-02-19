import type { CareerEvent, GeneratedCareerEventParameter } from "@/core/domain"

function ensureDate(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  if (value.length === 7) return `${value}-01`
  if (value.length >= 10) return value.slice(0, 10)
  return fallback
}

export function formatEvents(events: CareerEvent[]): string {
  if (events.length === 0) return "(no events)"
  return events
    .map((e) => {
      const tags = e.tags?.length ? e.tags.join(", ") : "-"
      const desc = e.description ? e.description.replace(/\s+/g, " ") : "-"
      return `- ${e.startDate} to ${e.endDate} | ${e.name} | strength=${e.strength} | row=${e.row} | tags=${tags} | description=${desc}`
    })
    .join("\n")
}

export function normalizeEvents(
  events: GeneratedCareerEventParameter[],
  fallbackDate: string,
  tags: Array<{ id: string; name: string }>
): GeneratedCareerEventParameter[] {
  const validTagIds = new Set(tags.map((t) => t.id))
  const tagIdByName = new Map(tags.map((t) => [t.name, t.id]))

  return events.map((e) => ({
    name: e.name ?? "新しいイベント",
    startDate: ensureDate(e.startDate, fallbackDate),
    endDate: ensureDate(e.endDate, fallbackDate),
    tags: Array.isArray(e.tags)
      ? e.tags
          .map((t) => validTagIds.has(t) ? t : tagIdByName.get(t) ?? null)
          .filter((t): t is string => Boolean(t))
      : [],
    strength: Math.min(5, Math.max(1, Math.round(Number(e.strength) || 3))),
    row: typeof e.row === "number" && Number.isFinite(e.row) ? e.row : 0,
    description: e.description ?? null,
  }))
}
