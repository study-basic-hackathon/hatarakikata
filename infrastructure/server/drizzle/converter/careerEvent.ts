import type { CareerEvent } from '@/core/domain/entity/careerEvent'

import type { careerEvents, careerMapEventTagAttachments, careerMapEventTags } from '../schema'

type CareerEventRow = typeof careerEvents.$inferSelect
type TagAttachmentRow = typeof careerMapEventTagAttachments.$inferSelect
type TagRow = typeof careerMapEventTags.$inferSelect

type CareerEventWithTags = CareerEventRow & {
  tagAttachments: (TagAttachmentRow & { tag: TagRow })[]
}

export function careerEventRowToEntity(row: CareerEventWithTags): CareerEvent {
  return {
    id: row.id,
    careerMapId: row.careerMapId,
    name: row.name ?? '',
    type: row.type as 'living' | 'working' | 'feeling',
    startDate: row.startDate,
    endDate: row.endDate,
    tags: (row.tagAttachments ?? []).map((a) => ({
      id: a.tag.id,
      name: a.tag.name,
    })),
    strength: row.strength,
    row: row.row,
    description: row.description,
  } as CareerEvent
}
