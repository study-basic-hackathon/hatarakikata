import { CareerMap, CareerMapPayloadSchema } from "@/core/domain"
import { AppResult } from "@/core/util/appResult"
import { z } from "zod"

export const CreateCareerMapCommandParametersSchema = CareerMapPayloadSchema

export type CreateCareerMapCommandParametersInput = z.input<typeof CreateCareerMapCommandParametersSchema>

export type CreateCareerMapCommandParameters = z.infer<typeof CreateCareerMapCommandParametersSchema>

export type CreateCareerMapCommand = (parameters: CreateCareerMapCommandParametersInput) => Promise<AppResult<CareerMap>>
