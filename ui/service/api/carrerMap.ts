import type { CareerMap, PagedCareerMaps } from '@/core/domain'
import type { GetCareerMapParametersInput } from '@/core/application/usecase/careerMap/getCareerMap'
import type { UpdateCareerMapParametersInput } from '@/core/application/usecase/careerMap/updateCareerMap'
import { apiFetch } from './client'

export function listCareerMapsByUserId(input: { userId: string }): Promise<PagedCareerMaps> {
  return apiFetch<PagedCareerMaps>(`/api/users/${input.userId}/career-maps`)
}

export function listMyCareerMaps(): Promise<PagedCareerMaps> {
  return apiFetch<PagedCareerMaps>('/api/me/career-maps')
}

export function createMyCareerMap(): Promise<CareerMap> {
  return apiFetch<CareerMap>('/api/me/career-maps', { method: 'POST' })
}

export function getCareerMap(input: GetCareerMapParametersInput): Promise<CareerMap> {
  return apiFetch<CareerMap>(`/api/career-maps/${input.id}`)
}

export function updateCareerMap(input: UpdateCareerMapParametersInput): Promise<CareerMap> {
  const { id, ...body } = input
  return apiFetch<CareerMap>(`/api/career-maps/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}
