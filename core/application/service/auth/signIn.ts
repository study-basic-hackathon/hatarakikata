import { z } from 'zod'

import { AppResult } from '@/core/util/appResult'

import { AuthUser } from './authUser'

export const SignInParametersSchema = z.object({
  email: z.email('メールアドレスの形式が正しくありません'),
  password: z.string().min(1, 'パスワードは必須です'),
})

export type SignInParametersInput = z.input<typeof SignInParametersSchema>
export type SignInParameters = z.infer<typeof SignInParametersSchema>

export type SignIn = (input: SignInParameters) => Promise<AppResult<AuthUser>>
