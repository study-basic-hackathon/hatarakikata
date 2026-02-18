import { PagedCareerMaps } from "@/core/domain"
import { AppResult } from "@/core/util/appResult"
import { z } from "zod"

export const ListCareerMapByUserIdQueryParametersSchema = z.object({
  userId: z.string(),
})

export type ListCareerMapByUserIdQueryParametersInput = z.input<typeof ListCareerMapByUserIdQueryParametersSchema>

export type ListCareerMapByUserIdQueryParameters = z.infer<typeof ListCareerMapByUserIdQueryParametersSchema>

export type ListCareerMapByUserIdQuery = (parameters: ListCareerMapByUserIdQueryParametersInput) => Promise<AppResult<PagedCareerMaps>>
