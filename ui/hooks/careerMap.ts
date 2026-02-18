'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import type { UpdateCareerMapParametersInput } from '@/core/application/usecase/careerMap/updateCareerMap'
import {
  listCareerMapsByUserId,
  listMyCareerMaps,
  createMyCareerMap,
  getCareerMap,
  updateCareerMap,
} from '@/ui/service/api'

const CAREER_MAPS_QUERY_KEY = ['careerMaps'] as const
const CAREER_MAP_QUERY_KEY = ['careerMap'] as const

export function useCareerMapsByUserIdQuery(userId: string | undefined) {
  return useQuery({
    queryKey: [...CAREER_MAPS_QUERY_KEY, userId],
    queryFn: () => listCareerMapsByUserId({ userId: userId! }),
    enabled: !!userId,
  })
}

export function useMyCareerMapsQuery() {
  return useQuery({
    queryKey: [...CAREER_MAPS_QUERY_KEY, 'me'],
    queryFn: () => listMyCareerMaps(),
  })
}

export function useCreateMyCareerMapMutation() {
  return useMutation({
    mutationFn: () => createMyCareerMap(),
  })
}

export function useCareerMapQuery(id: string | undefined) {
  return useQuery({
    queryKey: [...CAREER_MAP_QUERY_KEY, id],
    queryFn: () => getCareerMap({ id: id! }),
    enabled: !!id,
  })
}

export function useUpdateCareerMapMutation() {
  return useMutation({
    mutationFn: (input: UpdateCareerMapParametersInput) => updateCareerMap(input),
  })
}
