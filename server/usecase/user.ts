import { makeInitialize } from '@/core/application/usecase/user/initialize'
import { makeUpdateUser } from '@/core/application/usecase/user/updateUser'
import { makeWithdraw } from '@/core/application/usecase/user/withdraw'
import { createCareerMapCommand, createCreditTransactionCommand, createMembershipCommand, createUserCommand, deleteCareerEventCommand, deleteCareerMapCommand, deleteUserCommand, updateUserCommand } from '@/infrastructure/server/drizzle/command'
import { findUserQuery, listCareerEventsByCareerMapIdQuery, listCareerMapByUserIdQuery } from '@/infrastructure/server/drizzle/query'

export const initialize = makeInitialize({
  createUserCommand,
  createCareerMapCommand,
  findUserQuery,
  createCreditTransactionCommand,
  createMembershipCommand,
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
