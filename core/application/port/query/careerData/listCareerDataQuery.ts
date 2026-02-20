import type { AppResult } from "@/core/util/appResult"

export type ListCareerDataQuery = () => Promise<AppResult<{ names: string[] }>>
