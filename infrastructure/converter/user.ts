import type { User } from "@/core/domain/entity/user"
import type { UserRow } from "@/infrastructure/types"

export function userRowToEntity(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
  }
}

export function userEntityToRow(entity: User): UserRow {
  return {
    id: entity.id,
    name: entity.name,
  }
}
