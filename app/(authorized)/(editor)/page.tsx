'use client'

import { useEffect } from 'react'
import { useMyCareerMapsQuery, useCreateMyCareerMapMutation } from '@/ui/hooks/careerMap'
import CareerMapEditor from '@/ui/components/domain/CarrerMapEditor'

export default function HomePage() {
  const { data: careerMaps, refetch: refetchMaps } = useMyCareerMapsQuery()
  const createMapMutation = useCreateMyCareerMapMutation()

  const careerMapId = careerMaps?.items[0]?.id
  const hasLoaded = careerMaps !== undefined
  const hasNoMaps = hasLoaded && careerMaps.items.length < 1

  useEffect(() => {
    if (hasNoMaps && !createMapMutation.isPending && !createMapMutation.isSuccess) {
      createMapMutation.mutate(undefined, {
        onSuccess: () => refetchMaps(),
      })
    }
  }, [hasNoMaps, createMapMutation.isPending, createMapMutation.isSuccess, createMapMutation, refetchMaps])

  if (!careerMapId) {
    return <div className="flex items-center justify-center w-full h-full text-foreground/50">読み込み中...</div>
  }

  return <CareerMapEditor careerMapId={careerMapId} />
}
