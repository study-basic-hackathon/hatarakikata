import { z } from "zod"

import { CareerEvent, CareerEventPayloadSchema } from "@/core/domain"
import { AppResult } from "@/core/util/appResult"

export const CreateCareerEventCommandParametersSchema = CareerEventPayloadSchema

export type CreateCareerEventCommandParametersInput = z.input<typeof CreateCareerEventCommandParametersSchema>

export type CreateCareerEventCommandParameters = z.infer<typeof CreateCareerEventCommandParametersSchema>

export type CreateCareerEventCommand = (parameters: CreateCareerEventCommandParametersInput) => Promise<AppResult<CareerEvent>>
