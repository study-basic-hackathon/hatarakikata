import type { PagedCareerMapEventTags } from '@/core/domain'

import { apiFetch } from './client'

export function listCareerMapEventTags(): Promise<PagedCareerMapEventTags> {
  return apiFetch<PagedCareerMapEventTags>('/api/career-map-event-tags')
}
