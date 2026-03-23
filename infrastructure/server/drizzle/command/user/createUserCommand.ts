import type { CreateUserCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { userRowToEntity } from '../../converter'
import { users } from '../../schema'

export const createUserCommand: CreateUserCommand = async ({ id, name }) => {
  try {
    const [row] = await db.insert(users).values({ id, name }).returning()

    return succeed(userRowToEntity(row))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
