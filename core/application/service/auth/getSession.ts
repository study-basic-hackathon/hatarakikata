import { AppResult } from '@/core/util/appResult'
import { AuthUser } from './authUser'

export type GetSession = () => Promise<AppResult<AuthUser | null>>
