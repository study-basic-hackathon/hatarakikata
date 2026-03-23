import type { CareerMap } from '@/core/domain/entity/careerMap'

import type { careerMaps } from '../schema'

type CareerMapRow = typeof careerMaps.$inferSelect

export function careerMapRowToEntity(row: CareerMapRow): CareerMap {
  return {
    id: row.id,
    userId: row.userId,
    startDate: row.startDate,
    endDate: new Date().toISOString().split('T')[0],
  }
}
