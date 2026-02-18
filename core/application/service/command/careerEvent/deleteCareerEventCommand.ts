import { CareerEvent, CareerEventKeySchema } from "@/core/domain"
import { AppResult } from "@/core/util/appResult"
import { z } from "zod"

export const DeleteCareerEventCommandParametersSchema = CareerEventKeySchema

export type DeleteCareerEventCommandParametersInput = z.input<typeof DeleteCareerEventCommandParametersSchema>

export type DeleteCareerEventCommandParameters = z.infer<typeof DeleteCareerEventCommandParametersSchema>

export type DeleteCareerEventCommand = (parameters: DeleteCareerEventCommandParametersInput) => Promise<AppResult<CareerEvent>>
