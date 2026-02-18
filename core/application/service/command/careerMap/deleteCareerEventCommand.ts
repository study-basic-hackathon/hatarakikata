import { CareerMap, CareerMapKeySchema } from "@/core/domain"
import { AppResult } from "@/core/util/appResult"
import { z } from "zod"

export const DeleteCareerMapCommandParametersSchema = CareerMapKeySchema

export type DeleteCareerMapCommandParametersInput = z.input<typeof DeleteCareerMapCommandParametersSchema>

export type DeleteCareerMapCommandParameters = z.infer<typeof DeleteCareerMapCommandParametersSchema>

export type DeleteCareerMapCommand = (parameters: DeleteCareerMapCommandParametersInput) => Promise<AppResult<CareerMap>>
