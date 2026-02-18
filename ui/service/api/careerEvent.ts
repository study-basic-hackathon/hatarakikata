import type { CareerEvent, PagedCareerEvents } from '@/core/domain'
import type { ListCareerEventsByCareerMapIdParametersInput } from '@/core/application/usecase/careerEvent/listCareerEventsByCareerMapId'
import type { GetCareerEventParametersInput } from '@/core/application/usecase/careerEvent/getCareerEvent'
import type { CreateCareerEventParametersInput } from '@/core/application/usecase/careerEvent/createCareerEvent'
import type { UpdateCareerEventParametersInput } from '@/core/application/usecase/careerEvent/updateCareerEvent'
import type { DeleteCareerEventParametersInput } from '@/core/application/usecase/careerEvent/deleteCareerEvent'
import { apiFetch } from './client'

export function listCareerEventsByCareerMapId(input: ListCareerEventsByCareerMapIdParametersInput): Promise<PagedCareerEvents> {
  return apiFetch<PagedCareerEvents>(`/api/career-maps/${input.careerMapId}/career-events`)
}

export function getCareerEvent(input: GetCareerEventParametersInput): Promise<CareerEvent> {
  return apiFetch<CareerEvent>(`/api/career-events/${input.id}`)
}

export function createCareerEvent(input: CreateCareerEventParametersInput): Promise<CareerEvent> {
  const { careerMapId, ...body } = input
  return apiFetch<CareerEvent>(`/api/career-maps/${careerMapId}/career-events`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateCareerEvent(input: UpdateCareerEventParametersInput): Promise<CareerEvent> {
  const { id, ...body } = input
  return apiFetch<CareerEvent>(`/api/career-events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function deleteCareerEvent(input: DeleteCareerEventParametersInput): Promise<void> {
  return apiFetch<void>(`/api/career-events/${input.id}`, {
    method: 'DELETE',
  })
}
