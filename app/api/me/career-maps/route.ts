import { failAsForbiddenError } from '@/core/util/appResult'
import { createCareerMapCommand } from '@/infrastructure/server/drizzle/command'
import { listCareerMapByUserIdQuery } from '@/infrastructure/server/drizzle/query'
import { toResponse } from '@/server/lib/response'
import { getExecutor } from '@/server/service/auth'

export async function GET() {
  const executor = await getExecutor()

  if (executor.type !== 'user' || executor.userType !== 'general') {
    return toResponse(failAsForbiddenError('Forbidden'))
  }

  const result = await listCareerMapByUserIdQuery({ userId: executor.user.id })
  return toResponse(result)
}

export async function POST() {
  const executor = await getExecutor()

  if (executor.type !== 'user' || executor.userType !== 'general') {
    return toResponse(failAsForbiddenError('Forbidden'))
  }

  const result = await createCareerMapCommand({ userId: executor.user.id, startDate: null })
  return toResponse(result)
}
