import type { AppResult } from "@/core/util/appResult"

export type ListUserNamesQuery = () => Promise<AppResult<{ names: string[] }>>
