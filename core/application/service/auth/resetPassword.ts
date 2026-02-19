import { z } from 'zod'

import { AppResult } from '@/core/util/appResult'

export const ResetPasswordParametersSchema = z.object({
  email: z.email('メールアドレスの形式が正しくありません'),
})

export type ResetPasswordParametersInput = z.input<typeof ResetPasswordParametersSchema>
export type ResetPasswordParameters = z.infer<typeof ResetPasswordParametersSchema>

export type ResetPassword = (input: ResetPasswordParameters) => Promise<AppResult<void>>
