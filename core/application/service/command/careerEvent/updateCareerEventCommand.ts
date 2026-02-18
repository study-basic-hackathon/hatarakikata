import { CareerEvent, CareerEventKeySchema, CareerEventPayloadBaseSchema } from "@/core/domain"
import { AppResult } from "@/core/util/appResult"
import { z } from "zod"

export const UpdateCareerEventCommandParametersSchema = CareerEventKeySchema.extend(
  CareerEventPayloadBaseSchema.partial().shape,
)

export type UpdateCareerEventCommandParametersInput = z.input<typeof UpdateCareerEventCommandParametersSchema>

export type UpdateCareerEventCommandParameters = z.infer<typeof UpdateCareerEventCommandParametersSchema>

export type UpdateCareerEventCommand = (parameters: UpdateCareerEventCommandParametersInput) => Promise<AppResult<CareerEvent>>
