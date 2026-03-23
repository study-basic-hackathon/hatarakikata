import type { ListUserNamesQuery } from '@/core/application/port/query'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

import { db } from '../../client'
import { users } from '../../schema'

export const listUserNamesQuery: ListUserNamesQuery = async () => {
  try {
    const rows = await db.select({ name: users.name }).from(users)
    const names = rows.map((row) => row.name).filter((name): name is string => name !== null)
    return succeed({ names })
  } catch (error) {
    return failAsExternalServiceError('Failed to list user names', error)
  }
}
