import type { CareerQuestion } from '@/core/domain/entity/careerQuestion'

import type { careerQuestions } from '../schema'

type CareerQuestionRow = typeof careerQuestions.$inferSelect

export function careerQuestionRowToEntity(row: CareerQuestionRow): CareerQuestion {
  return {
    id: row.id,
    careerMapId: row.careerMapId,
    name: row.name,
    title: row.title,
    status: row.status as 'open' | 'closed',
    fields: row.fields as CareerQuestion['fields'],
    row: row.row ?? undefined,
    startDate: row.startDate ?? undefined,
    endDate: row.endDate ?? undefined,
  }
}
