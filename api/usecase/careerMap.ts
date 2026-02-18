import { makeGetCareerMap } from '@/core/application/usecase/careerMap/getCareerMap'
import { makeUpdateCareerMap } from '@/core/application/usecase/careerMap/updateCareerMap'
import { updateCareerMapCommand } from '@/infrastructure/server/supabase/command'
import { findCareerMapQuery } from '@/infrastructure/server/supabase/query'

export const getCareerMap = makeGetCareerMap({
  findCareerMapQuery,
})

export const updateCareerMap = makeUpdateCareerMap({
  updateCareerMapCommand,
  findCareerMapQuery,
})
