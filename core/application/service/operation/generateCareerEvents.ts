import { z } from "zod"

import { CareerEventSchema, CareerMapSchema, GenerateCareerEventsResultSchema } from "@/core/domain"
import type { AppResult } from "@/core/util/appResult"

export const GenerateCareerEventsOperationParametersSchema = z.object({
  question: z.string(),
  content: z.array(CareerEventSchema),
  map: CareerMapSchema,
  tags: z.array(z.object({ id: z.string(), name: z.string() })),
})

export type GenerateCareerEventsOperationParametersInput = z.input<
  typeof GenerateCareerEventsOperationParametersSchema
>

export type GenerateCareerEventsOperationParameters = z.infer<
  typeof GenerateCareerEventsOperationParametersSchema
>

export type GenerateCareerEventsOperationResult = z.infer<
  typeof GenerateCareerEventsResultSchema
>

export type GenerateCareerEventsOperation = (
  parameters: GenerateCareerEventsOperationParameters
) => Promise<AppResult<GenerateCareerEventsOperationResult>>
