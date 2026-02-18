import { z } from 'zod'
import { AppResult } from '@/core/util/appResult'
import { AuthUser } from './authUser'

export const SignUpParametersSchema = z.object({
  email: z.email('メールアドレスの形式が正しくありません'),
  password: z.string().min(8, '8文字以上で入力してください'),
})

export type SignUpParametersInput = z.input<typeof SignUpParametersSchema>
export type SignUpParameters = z.infer<typeof SignUpParametersSchema>

export type SignUp = (input: SignUpParameters) => Promise<AppResult<AuthUser>>
