import type { CareerEvent } from "@/core/domain/entity/careerEvent"
import type { CareerEventWithTagsRow } from "@/infrastructure/types"

export function careerEventRowToEntity(row: CareerEventWithTagsRow): CareerEvent {
  return {
    id: row.id,
    careerMapId: row.career_map_id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    tags: (row.career_map_event_tag_attachments ?? []).map(
      (a) => a.career_map_event_tags.id
    ),
    strength: row.strength,
    row: row.row,
    description: row.description,
  } as CareerEvent
}

export function careerEventEntityToRow(entity: CareerEvent): Record<string, unknown> {
  return {
    id: entity.id,
    career_map_id: entity.careerMapId,
    name: entity.name,
    start_date: entity.startDate,
    end_date: entity.endDate,
    strength: entity.strength,
    row: entity.row,
    description: entity.description,
  }
}
