import { eq } from 'drizzle-orm'

import type { UpdateUserCommand } from '@/core/application/port/command'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { userRowToEntity } from '../../converter'
import { users } from '../../schema'

export const updateUserCommand: UpdateUserCommand = async ({ id, ...rest }) => {
  try {
    const [row] = await db.update(users).set(rest).where(eq(users.id, id)).returning()

    return succeed(userRowToEntity(row))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
