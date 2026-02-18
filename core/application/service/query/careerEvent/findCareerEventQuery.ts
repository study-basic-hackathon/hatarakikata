import { CareerEvent, CareerEventKeySchema } from "@/core/domain"
import { AppResult } from "@/core/util/appResult"
import { z } from "zod"

export const FindCareerEventQueryParametersSchema = CareerEventKeySchema

export type FindCareerEventQueryParametersInput = z.input<typeof FindCareerEventQueryParametersSchema>

export type FindCareerEventQueryParameters = z.infer<typeof FindCareerEventQueryParametersSchema>

export type FindCareerEventQuery = (parameters: FindCareerEventQueryParametersInput) => Promise<AppResult<null | CareerEvent>>
