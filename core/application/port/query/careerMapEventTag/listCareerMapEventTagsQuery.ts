import { PagedCareerMapEventTags } from "@/core/domain"
import { AppResult } from "@/core/util/appResult"

export type ListCareerMapEventTagsQuery = () => Promise<AppResult<PagedCareerMapEventTags>>
