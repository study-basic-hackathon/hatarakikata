import { CareerMap, CareerMapKeySchema } from "@/core/domain"
import { AppResult } from "@/core/util/appResult"
import { z } from "zod"

export const FindCareerMapQueryParametersSchema = CareerMapKeySchema

export type FindCareerMapQueryParametersInput = z.input<typeof FindCareerMapQueryParametersSchema>

export type FindCareerMapQueryParameters = z.infer<typeof FindCareerMapQueryParametersSchema>

export type FindCareerMapQuery = (parameters: FindCareerMapQueryParametersInput) => Promise<AppResult<null | CareerMap>>
