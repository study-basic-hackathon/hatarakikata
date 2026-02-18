import { makeInitialize } from '@/core/application/usecase/user/initialize'
import { makeUpdateUser } from '@/core/application/usecase/user/updateUser'
import { makeWithdraw } from '@/core/application/usecase/user/withdraw'
import { createUserCommand, deleteUserCommand, updateUserCommand, createCareerMapCommand, deleteCareerMapCommand, deleteCareerEventCommand } from '@/infrastructure/server/supabase/command'
import { findUserQuery, listCareerMapByUserIdQuery, listCareerEventsByCareerMapIdQuery } from '@/infrastructure/server/supabase/query'

export const initialize = makeInitialize({
  createUserCommand,
  createCareerMapCommand,
  findUserQuery,
})

export const updateUser = makeUpdateUser({
  updateUserCommand,
  findUserQuery,
})

export const withdraw = makeWithdraw({
  deleteUserCommand,
  deleteCareerMapCommand,
  deleteCareerEventCommand,
  findUserQuery,
  listCareerMapByUserIdQuery,
  listCareerEventsByCareerMapIdQuery,
})
