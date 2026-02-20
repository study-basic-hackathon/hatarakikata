import { AppResult } from "@/core/util/appResult"

export type ListAllCareerMapIdsQuery = () => Promise<AppResult<string[]>>
