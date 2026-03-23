import { makeRedeemInvitation } from '@/core/application/usecase/invitation/redeemInvitation'
import { updateInvitationCommand, updateMembershipCommand } from '@/infrastructure/server/drizzle/command'
import { findInvitationByCodeQuery } from '@/infrastructure/server/drizzle/query'

export const redeemInvitation = makeRedeemInvitation({
  findInvitationByCodeQuery,
  updateInvitationCommand,
  updateMembershipCommand,
})
