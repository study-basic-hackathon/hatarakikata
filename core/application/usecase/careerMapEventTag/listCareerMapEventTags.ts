import { PagedCareerMapEventTags } from "@/core/domain"
import { AppResult, failAsForbiddenError } from "@/core/util/appResult"
import { Executor } from "../../executor"
import { ListCareerMapEventTagsQuery } from "../../service/query"

export type ListCareerMapEventTags = (
  executor: Executor
) => Promise<AppResult<PagedCareerMapEventTags>>

export type MakeListCareerMapEventTagsDependencies = {
  listCareerMapEventTagsQuery: ListCareerMapEventTagsQuery
}

export function makeListCareerMapEventTags({
  listCareerMapEventTagsQuery,
}: MakeListCareerMapEventTagsDependencies): ListCareerMapEventTags {
  return async (executor) => {
    if (executor.type !== "user" || executor.userType !== "general") {
      return failAsForbiddenError("Forbidden")
    }

    return await listCareerMapEventTagsQuery()
  }
}
