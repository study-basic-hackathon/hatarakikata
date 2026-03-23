import type { CareerGuide, CareerGuideWithSource } from '@/core/domain/entity/careerGuide'

import type { careerGuides } from '../schema'

type CareerGuideRow = typeof careerGuides.$inferSelect

export function careerGuideRowToEntity(row: CareerGuideRow): CareerGuide {
  return {
    id: row.id,
    userId: row.userId,
    baseCareerMapId: row.baseCareerMapId,
    guideCareerMapId: row.guideCareerMapId,
    content: row.content,
    nextActions: row.nextActions as CareerGuide['nextActions'],
    createdAt: row.createdAt.toISOString(),
  }
}

export function careerGuideRowWithSourceToEntity(
  row: CareerGuideRow & { baseCareerMap: { userId: string; user: { name: string | null } | null } | null },
): CareerGuideWithSource {
  return {
    id: row.id,
    userId: row.userId,
    baseCareerMapId: row.baseCareerMapId,
    guideCareerMapId: row.guideCareerMapId,
    content: row.content,
    nextActions: row.nextActions as CareerGuide['nextActions'],
    createdAt: row.createdAt.toISOString(),
    sourceUserName: row.baseCareerMap?.user?.name ?? null,
  }
}
