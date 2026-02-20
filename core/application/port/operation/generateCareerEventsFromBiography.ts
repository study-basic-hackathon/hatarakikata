import { z } from "zod"

import { GenerateCareerEventsResultSchema } from "@/core/domain"
import type { AppResult } from "@/core/util/appResult"

export const GenerateCareerEventsFromBiographyOperationParametersSchema = z.object({
  personName: z.string().min(1),
  biographyMarkdown: z.string().min(1),
  birthDate: z.string().nullable(),
  tags: z.array(z.object({ id: z.string(), name: z.string() })),
})

export type GenerateCareerEventsFromBiographyOperationParametersInput = z.input<
  typeof GenerateCareerEventsFromBiographyOperationParametersSchema
>

export type GenerateCareerEventsFromBiographyOperationParameters = z.infer<
  typeof GenerateCareerEventsFromBiographyOperationParametersSchema
>

export type GenerateCareerEventsFromBiographyOperationResult = z.infer<
  typeof GenerateCareerEventsResultSchema
>

export type GenerateCareerEventsFromBiographyOperation = (
  parameters: GenerateCareerEventsFromBiographyOperationParameters
) => Promise<AppResult<GenerateCareerEventsFromBiographyOperationResult>>
