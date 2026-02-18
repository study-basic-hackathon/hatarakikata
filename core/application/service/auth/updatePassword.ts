import { z } from 'zod'
import { AppResult } from '@/core/util/appResult'

export const UpdatePasswordParametersSchema = z.object({
  password: z.string().min(8, '8文字以上で入力してください'),
  confirmPassword: z.string().min(1, '確認用パスワードを入力してください'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
})

export type UpdatePasswordParametersInput = z.input<typeof UpdatePasswordParametersSchema>
export type UpdatePasswordParameters = z.infer<typeof UpdatePasswordParametersSchema>

export type UpdatePassword = (input: UpdatePasswordParameters) => Promise<AppResult<void>>
