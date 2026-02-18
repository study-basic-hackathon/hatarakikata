import { getExecutor } from '@/api/service/auth'
import { listCareerMapEventTags } from '@/api/usecase'
import { toResponse } from '@/api/lib/response'

export async function GET() {
  const executor = await getExecutor()
  const result = await listCareerMapEventTags(executor)
  return toResponse(result)
}
