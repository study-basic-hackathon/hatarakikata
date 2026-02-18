import { makeCreateCareerEvent } from '@/core/application/usecase/careerEvent/createCareerEvent'
import { makeUpdateCareerEvent } from '@/core/application/usecase/careerEvent/updateCareerEvent'
import { makeDeleteCareerEvent } from '@/core/application/usecase/careerEvent/deleteCareerEvent'
import { makeGetCareerEvent } from '@/core/application/usecase/careerEvent/getCareerEvent'
import { makeListCareerEventsByCareerMapId } from '@/core/application/usecase/careerEvent/listCareerEventsByCareerMapId'
import { createCareerEventCommand, updateCareerEventCommand, deleteCareerEventCommand } from '@/infrastructure/server/supabase/command'
import { findCareerEventQuery, findCareerMapQuery, listCareerEventsByCareerMapIdQuery } from '@/infrastructure/server/supabase/query'

export const createCareerEvent = makeCreateCareerEvent({
  createCareerEventCommand,
  findCareerMapQuery,
})

export const updateCareerEvent = makeUpdateCareerEvent({
  updateCareerEventCommand,
  findCareerEventQuery,
  findCareerMapQuery,
})

export const deleteCareerEvent = makeDeleteCareerEvent({
  deleteCareerEventCommand,
  findCareerEventQuery,
  findCareerMapQuery,
})

export const getCareerEvent = makeGetCareerEvent({
  findCareerEventQuery,
  findCareerMapQuery,
})

export const listCareerEventsByCareerMapId = makeListCareerEventsByCareerMapId({
  listCareerEventsByCareerMapIdQuery,
  findCareerMapQuery,
})
