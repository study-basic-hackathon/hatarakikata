import { CareerEvent, CareerEventPayloadSchema } from "@/core/domain"
import { AppResult } from "@/core/util/appResult"
import { z } from "zod"

export const CreateCareerEventCommandParametersSchema = CareerEventPayloadSchema

export type CreateCareerEventCommandParametersInput = z.input<typeof CreateCareerEventCommandParametersSchema>

export type CreateCareerEventCommandParameters = z.infer<typeof CreateCareerEventCommandParametersSchema>

export type CreateCareerEventCommand = (parameters: CreateCareerEventCommandParametersInput) => Promise<AppResult<CareerEvent>>
