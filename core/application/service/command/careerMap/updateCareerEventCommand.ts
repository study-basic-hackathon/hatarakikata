import { z } from "zod"

import { CareerMap, CareerMapKeySchema, CareerMapPayloadSchema,  } from "@/core/domain"
import { AppResult } from "@/core/util/appResult"

export const UpdateCareerMapCommandParametersSchema = CareerMapKeySchema.extend(
  CareerMapPayloadSchema.partial().shape
)

export type UpdateCareerMapCommandParametersInput = z.input<typeof UpdateCareerMapCommandParametersSchema>

export type UpdateCareerMapCommandParameters = z.infer<typeof UpdateCareerMapCommandParametersSchema>

export type UpdateCareerMapCommand = (parameters: UpdateCareerMapCommandParametersInput) => Promise<AppResult<CareerMap>>
