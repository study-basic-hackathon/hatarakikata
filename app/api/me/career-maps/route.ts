import { getExecutor } from '@/api/service/auth'
import { toResponse } from '@/api/lib/response'
import { createCareerMapCommand } from '@/infrastructure/server/supabase/command'
import { listCareerMapByUserIdQuery } from '@/infrastructure/server/supabase/query'
import { failAsForbiddenError } from '@/core/util/appResult'

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
