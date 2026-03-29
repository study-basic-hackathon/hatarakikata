import { makeImportUsers } from '@/core/application/usecase/user/importUsers'
import { createAuthUserCommand } from '@/infrastructure/server/drizzle/command/auth/createAuthUserCommand'
import { deleteAuthUserByIdCommand } from '@/infrastructure/server/drizzle/command/auth/deleteAuthUserByIdCommand'
import { createCareerEventCommand } from '@/infrastructure/server/drizzle/command/careerEvent/createCareerEventCommand'
import { createCareerMapCommand } from '@/infrastructure/server/drizzle/command/careerMap/createCareerMapCommand'
import { createCreditTransactionCommand } from '@/infrastructure/server/drizzle/command/credit/createCreditTransactionCommand'
import { createMembershipCommand } from '@/infrastructure/server/drizzle/command/membership/createMembershipCommand'
import { createUserCommand } from '@/infrastructure/server/drizzle/command/user/createUserCommand'
import { deleteUserCommand } from '@/infrastructure/server/drizzle/command/user/deleteUserCommand'
import { listCareerMapEventTagsQuery } from '@/infrastructure/server/drizzle/query/careerMapEventTag/listCareerMapEventTagsQuery'
import { findUserByNameQuery } from '@/infrastructure/server/drizzle/query/user/findUserByNameQuery'
import { writeUserCredentialsCommand } from '@/infrastructure/server/fs/command/writeUserCredentialsCommand'
import { readCareerMapSnapshotQuery } from '@/infrastructure/server/fs/query/readCareerMapSnapshotQuery'

export function createImportUsers(
  onProgress?: (current: number, total: number, failed: number) => void,
  onLog?: (message: string) => void,
) {
  return makeImportUsers({
    readCareerMapSnapshotQuery,
    writeUserCredentialsCommand,
    findUserByNameQuery,
    deleteUserCommand,
    deleteAuthUserByIdCommand,
    createAuthUserCommand,
    createUserCommand,
    createMembershipCommand,
    createCreditTransactionCommand,
    createCareerMapCommand,
    createCareerEventCommand,
    listCareerMapEventTagsQuery,
    onProgress,
    onLog,
  })
}
