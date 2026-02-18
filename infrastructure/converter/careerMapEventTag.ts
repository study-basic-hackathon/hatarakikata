import type { CareerMapEventTag } from "@/core/domain/entity/careerMapEventTag"
import type { CareerMapEventTagRow } from "@/infrastructure/types"

export function careerMapEventTagRowToEntity(row: CareerMapEventTagRow): CareerMapEventTag {
  return {
    id: row.id,
    name: row.name,
  }
}

export function careerMapEventTagEntityToRow(entity: CareerMapEventTag): CareerMapEventTagRow {
  return {
    id: entity.id,
    name: entity.name,
  }
}
