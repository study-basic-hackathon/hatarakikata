import { AppError, ExternalServiceError, ForbiddenError, InternalServerError, InvalidParametersError, NotFoundError } from '@/core/error/appError'
import { AppResult } from './types'

export * from './types'

function toMessage(value: unknown): string {
  if (value instanceof Error) return value.message
  if (typeof value === "string") return value
  return String(value)
}

export function fail<T>(error: AppError): AppResult<T> {
  return {
    success: false,
    error,
  }
}

export function succeed<T>(data: T): AppResult<T> {
  return {
    success: true,
    data,
  }
}

export function failAsInvalidParametersError<T>(cause: unknown): AppResult<T> {
  return fail<T>({ type: "InvalidParametersError", message: toMessage(cause), cause } satisfies InvalidParametersError)
}

export function failAsNotFoundError<T>(cause: unknown): AppResult<T> {
  return fail<T>({ type: "NotFoundError", message: toMessage(cause), cause } satisfies NotFoundError)
}

export function failAsForbiddenError<T>(cause: unknown): AppResult<T> {
  return fail<T>({ type: "ForbiddenError", message: toMessage(cause), cause } satisfies ForbiddenError)
}

export function failAsInternalServerError<T>(cause: unknown): AppResult<T> {
  return fail<T>({ type: "InternalServerError", message: toMessage(cause), cause } satisfies InternalServerError)
}

export function failAsExternalServiceError<T>(cause: unknown): AppResult<T> {
  return fail<T>({ type: "ExternalServiceError", message: toMessage(cause), cause } satisfies ExternalServiceError)
}
