import { NextRequest } from 'next/server'
import { getExecutor } from '@/api/service/auth'
import { updateUser, withdraw } from '@/api/usecase'
import { toResponse } from '@/api/lib/response'
import { findUserQuery } from '@/infrastructure/server/supabase/query'
import { failAsNotFoundError } from '@/core/util/appResult'

export async function GET() {
  const executor = await getExecutor()
  const result = await findUserQuery({ id: executor.user.id })
  if (result.success && result.data === null) {
    return toResponse(failAsNotFoundError('User not found'))
  }
  return toResponse(result)
}

export async function PUT(request: NextRequest) {
  const executor = await getExecutor()
  const body = await request.json()
  const result = await updateUser({ id: executor.user.id, ...body }, executor)
  return toResponse(result)
}

export async function DELETE() {
  const executor = await getExecutor()
  const result = await withdraw({ id: executor.user.id }, executor)
  return toResponse(result)
}
