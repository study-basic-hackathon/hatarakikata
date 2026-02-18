import { z } from 'zod'
import { AppResult } from '@/core/util/appResult'

export const UpdateEmailParametersSchema = z.object({
  email: z.email('メールアドレスの形式が正しくありません'),
})

export type UpdateEmailParametersInput = z.input<typeof UpdateEmailParametersSchema>
export type UpdateEmailParameters = z.infer<typeof UpdateEmailParametersSchema>

export type UpdateEmail = (input: UpdateEmailParameters) => Promise<AppResult<void>>
