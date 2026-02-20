import type { User } from "@/core/domain"
import type { AppResult } from "@/core/util/appResult"

export type FindUserByNameQuery = (name: string) => Promise<AppResult<null | User>>
