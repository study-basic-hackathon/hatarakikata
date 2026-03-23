import { eq } from 'drizzle-orm'

import type { DeleteUserCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { userRowToEntity } from '../../converter'
import { users } from '../../schema'

export const deleteUserCommand: DeleteUserCommand = async ({ id }) => {
  try {
    const [row] = await db.delete(users).where(eq(users.id, id)).returning()

    return succeed(userRowToEntity(row))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
