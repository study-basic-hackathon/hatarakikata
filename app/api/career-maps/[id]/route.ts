import { NextRequest } from 'next/server'

import { toResponse } from '@/api/lib/response'
import { getExecutor } from '@/api/service/auth'
import { getCareerMap, updateCareerMap } from '@/api/usecase'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const executor = await getExecutor()
  const { id } = await params
  const result = await getCareerMap({ id }, executor)
  return toResponse(result)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const executor = await getExecutor()
  const { id } = await params
  const body = await request.json()
  const result = await updateCareerMap({ id, ...body }, executor)
  return toResponse(result)
}
