import { AppResult } from "@/core/util/appResult"

export type FindCareerMapEventTagsByIdsQuery = (ids: string[]) => Promise<AppResult<{ id: string; name: string }[]>>
