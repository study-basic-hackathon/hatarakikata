import type { CareerMap } from "@/core/domain/entity/careerMap"

import type { CareerMapRow } from "../schemas"

export function careerMapRowToEntity(row: CareerMapRow): CareerMap {
  return {
    id: row.id,
    userId: row.user_id,
    startDate: row.start_date,
    endDate: new Date().toISOString().split("T")[0],
  }
}

export function careerMapEntityToRow(entity: Omit<CareerMap, "endDate">): CareerMapRow {
  return {
    id: entity.id,
    user_id: entity.userId,
    start_date: entity.startDate,
  }
}
