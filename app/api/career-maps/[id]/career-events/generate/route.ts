import { NextRequest } from 'next/server'

import { toResponse } from '@/api/lib/response'
import { getExecutor } from '@/api/service/auth'
import { generateCareerEvents } from '@/api/usecase'

export const maxDuration = 60

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const executor = await getExecutor()
  const { id } = await params
  const body = await request.json()
  const result = await generateCareerEvents({ careerMapId: id, ...body }, executor)
  return toResponse(result)
}
