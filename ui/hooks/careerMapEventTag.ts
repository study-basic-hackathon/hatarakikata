'use client'

import { useQuery } from '@tanstack/react-query'
import { listCareerMapEventTags } from '@/ui/service/api'

const CAREER_MAP_EVENT_TAGS_QUERY_KEY = ['careerMapEventTags'] as const

export function useCareerMapEventTagsQuery() {
  return useQuery({
    queryKey: CAREER_MAP_EVENT_TAGS_QUERY_KEY,
    queryFn: () => listCareerMapEventTags(),
  })
}
