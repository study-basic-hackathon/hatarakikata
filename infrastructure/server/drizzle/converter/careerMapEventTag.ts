import type { CareerMapEventTag } from '@/core/domain/entity/careerMapEventTag'

import type { careerMapEventTags } from '../schema'

type CareerMapEventTagRow = typeof careerMapEventTags.$inferSelect

export function careerMapEventTagRowToEntity(row: CareerMapEventTagRow): CareerMapEventTag {
  return {
    id: row.id,
    name: row.name,
  }
}
