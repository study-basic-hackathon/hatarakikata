import { createSupabaseServer } from '../client'
import { makeCreateUserCommand, makeUpdateUserCommand, makeDeleteUserCommand } from './user'
import { makeCreateCareerMapCommand, makeUpdateCareerMapCommand, makeDeleteCareerMapCommand } from './careerMap'
import { makeCreateCareerEventCommand, makeUpdateCareerEventCommand, makeDeleteCareerEventCommand } from './careerEvent'

function withServer<T extends (...args: never[]) => Promise<unknown>>(
  makeFn: (supabase: Awaited<ReturnType<typeof createSupabaseServer>>) => T,
): T {
  return (async (...args: Parameters<T>) => {
    const supabase = await createSupabaseServer()
    return makeFn(supabase)(...args)
  }) as T
}

export const createUserCommand = withServer(makeCreateUserCommand)
export const updateUserCommand = withServer(makeUpdateUserCommand)
export const deleteUserCommand = withServer(makeDeleteUserCommand)
export const createCareerMapCommand = withServer(makeCreateCareerMapCommand)
export const updateCareerMapCommand = withServer(makeUpdateCareerMapCommand)
export const deleteCareerMapCommand = withServer(makeDeleteCareerMapCommand)
export const createCareerEventCommand = withServer(makeCreateCareerEventCommand)
export const updateCareerEventCommand = withServer(makeUpdateCareerEventCommand)
export const deleteCareerEventCommand = withServer(makeDeleteCareerEventCommand)
