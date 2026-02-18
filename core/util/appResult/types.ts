import { Result } from '@/util/result'

import { AppError } from '../../error/appError'

export type AppResult<T> = Result<T, AppError>
