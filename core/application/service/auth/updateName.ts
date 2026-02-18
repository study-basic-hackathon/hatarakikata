import { z } from 'zod'
import { AppResult } from '@/core/util/appResult'

export const UpdateNameParametersSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
})

export type UpdateNameParametersInput = z.input<typeof UpdateNameParametersSchema>
export type UpdateNameParameters = z.infer<typeof UpdateNameParametersSchema>

export type UpdateName = (input: UpdateNameParameters) => Promise<AppResult<void>>
