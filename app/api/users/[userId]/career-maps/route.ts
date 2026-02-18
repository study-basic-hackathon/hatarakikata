import { getExecutor } from '@/api/service/auth'
import { toResponse } from '@/api/lib/response'
import { listCareerMapByUserIdQuery } from '@/infrastructure/server/supabase/query'
import { failAsForbiddenError } from '@/core/util/appResult'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const executor = await getExecutor()
  const { userId } = await params

  if (executor.type !== 'user' || executor.userType !== 'general') {
    return toResponse(failAsForbiddenError('Forbidden'))
  }

  if (executor.user.id !== userId) {
    return toResponse(failAsForbiddenError('Forbidden'))
  }

  const result = await listCareerMapByUserIdQuery({ userId })
  return toResponse(result)
}
