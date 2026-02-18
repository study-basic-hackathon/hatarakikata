import { createSupabaseServer } from '../client'
import { makeFindUserQuery } from './user'
import { makeFindCareerMapQuery, makeListCareerMapByUserIdQuery } from './careerMap'
import { makeFindCareerEventQuery, makeListCareerEventsByCareerMapIdQuery } from './careerEvent'
import { makeListCareerMapEventTagsQuery } from './careerMapEventTag'

function withServer<T extends (...args: never[]) => Promise<unknown>>(
  makeFn: (supabase: Awaited<ReturnType<typeof createSupabaseServer>>) => T,
): T {
  return (async (...args: Parameters<T>) => {
    const supabase = await createSupabaseServer()
    return makeFn(supabase)(...args)
  }) as T
}

export const findUserQuery = withServer(makeFindUserQuery)
export const findCareerMapQuery = withServer(makeFindCareerMapQuery)
export const listCareerMapByUserIdQuery = withServer(makeListCareerMapByUserIdQuery)
export const findCareerEventQuery = withServer(makeFindCareerEventQuery)
export const listCareerEventsByCareerMapIdQuery = withServer(makeListCareerEventsByCareerMapIdQuery)
export const listCareerMapEventTagsQuery = withServer(makeListCareerMapEventTagsQuery)
