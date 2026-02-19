'use client'

import { useMutation,useQuery } from '@tanstack/react-query'

import type { CreateCareerEventParametersInput } from '@/core/application/usecase/careerEvent/createCareerEvent'
import type { DeleteCareerEventParametersInput } from '@/core/application/usecase/careerEvent/deleteCareerEvent'
import type { GenerateCareerEventsParametersInput } from '@/core/application/usecase/careerEvent/generateCareerEvents'
import type { UpdateCareerEventParametersInput } from '@/core/application/usecase/careerEvent/updateCareerEvent'
import {
  createCareerEvent,
  deleteCareerEvent,
  generateCareerEvents,
  getCareerEvent,
  listCareerEventsByCareerMapId,
  updateCareerEvent,
} from '@/ui/service/api'

const CAREER_EVENTS_QUERY_KEY = ['careerEvents'] as const
const CAREER_EVENT_QUERY_KEY = ['careerEvent'] as const

export function useCareerEventsByCareerMapIdQuery(careerMapId: string | undefined) {
  return useQuery({
    queryKey: [...CAREER_EVENTS_QUERY_KEY, careerMapId],
    queryFn: () => listCareerEventsByCareerMapId({ careerMapId: careerMapId! }),
    enabled: !!careerMapId,
  })
}

export function useCareerEventQuery(id: string | undefined) {
  return useQuery({
    queryKey: [...CAREER_EVENT_QUERY_KEY, id],
    queryFn: () => getCareerEvent({ id: id! }),
    enabled: !!id,
  })
}

export function useCreateCareerEventMutation() {
  return useMutation({
    mutationFn: (input: CreateCareerEventParametersInput) => createCareerEvent(input),
  })
}

export function useUpdateCareerEventMutation() {
  return useMutation({
    mutationFn: (input: UpdateCareerEventParametersInput) => updateCareerEvent(input),
  })
}

export function useDeleteCareerEventMutation() {
  return useMutation({
    mutationFn: (input: DeleteCareerEventParametersInput) => deleteCareerEvent(input),
  })
}

export function useGenerateCareerEventsMutation() {
  return useMutation({
    mutationFn: (input: GenerateCareerEventsParametersInput) =>
      generateCareerEvents(input),
  })
}
