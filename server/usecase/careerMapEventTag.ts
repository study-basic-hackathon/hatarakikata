import { makeListCareerMapEventTags } from '@/core/application/usecase/careerMapEventTag/listCareerMapEventTags'
import { listCareerMapEventTagsQuery } from '@/infrastructure/server/drizzle/query'

export const listCareerMapEventTags = makeListCareerMapEventTags({
  listCareerMapEventTagsQuery,
})
