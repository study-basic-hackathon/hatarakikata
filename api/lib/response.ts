import { NextResponse } from 'next/server'
import type { AppResult } from '@/core/util/appResult'

export function toResponse<T>(result: AppResult<T>): NextResponse {
  if (result.success) {
    return NextResponse.json(result.data, { status: 200 })
  }

  const { error } = result
  const statusMap = {
    InvalidParametersError: 400,
    ForbiddenError: 403,
    NotFoundError: 404,
    InternalServerError: 500,
    ExternalServiceError: 502,
  } as const

  const status = statusMap[error.type]
  return NextResponse.json({ error: error.message }, { status })
}
