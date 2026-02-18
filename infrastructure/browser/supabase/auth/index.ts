import { getSupabaseBrowserClient } from '../client'
import { makeSignUp } from './signUp'
import { makeSignIn } from './signIn'
import { makeSignOut } from './signOut'
import { makeResetPassword } from './resetPassword'
import { makeGetSession } from './getSession'
import { makeUpdateEmail } from './updateEmail'
import { makeUpdatePassword } from './updatePassword'
import { makeUpdateName } from './updateName'

const supabase = getSupabaseBrowserClient()

export const signUp = makeSignUp(supabase)
export const signIn = makeSignIn(supabase)
export const signOut = makeSignOut(supabase)
export const resetPassword = makeResetPassword(supabase)
export const getSession = makeGetSession(supabase)
export const updateEmail = makeUpdateEmail(supabase)
export const updatePassword = makeUpdatePassword(supabase)
export const updateName = makeUpdateName(supabase)
