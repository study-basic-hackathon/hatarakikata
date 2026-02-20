import { NextRequest } from 'next/server'

import { toResponse } from '@/api/lib/response'
import { getIntParam } from '@/api/lib/searchParams'
import { getExecutor } from '@/api/service/auth'
import { getSimilarCareerMaps } from '@/api/usecase/careerMapVector'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const executor = await getExecutor()
  const { id } = await params
  const searchParams = new URL(request.url).searchParams
  const limit = getIntParam(searchParams, 'limit', { default: 10, min: 1, max: 50 })
  const offset = getIntParam(searchParams, 'offset', { default: 0, min: 0 })

  const result = await getSimilarCareerMaps({ id, limit, offset }, executor)
  return toResponse(result)
}
