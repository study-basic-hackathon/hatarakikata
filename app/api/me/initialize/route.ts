import { getExecutor } from '@/api/service/auth'
import { initialize } from '@/api/usecase'
import { toResponse } from '@/api/lib/response'

export async function POST() {
  const executor = await getExecutor()
  const result = await initialize(executor)
  return toResponse(result)
}
