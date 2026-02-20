import { z } from "zod"

import { PagedCareerEvents } from "@/core/domain"
import { AppResult } from "@/core/util/appResult"

export const ListCareerEventsByCareerMapIdQueryParametersSchema = z.object({
  careerMapId: z.string(),
})

export type ListCareerEventsByCareerMapIdQueryParametersInput = z.input<typeof ListCareerEventsByCareerMapIdQueryParametersSchema>

export type ListCareerEventsByCareerMapIdQueryParameters = z.infer<typeof ListCareerEventsByCareerMapIdQueryParametersSchema>

export type ListCareerEventsByCareerMapIdQuery = (parameters: ListCareerEventsByCareerMapIdQueryParametersInput) => Promise<AppResult<PagedCareerEvents>>
