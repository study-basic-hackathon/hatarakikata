import type { CareerData } from "@/core/application/port/command/careerData/saveCareerDataCommand"
import type { AppResult } from "@/core/util/appResult"

export type ReadCareerDataQuery = (
  personName: string
) => Promise<AppResult<CareerData>>
