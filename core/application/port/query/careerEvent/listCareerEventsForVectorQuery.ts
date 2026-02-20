import type { CareerEvent } from "@/core/domain/entity/careerEvent"
import { AppResult } from "@/core/util/appResult"

export type ListCareerEventsForVectorQuery = (careerMapId: string) => Promise<AppResult<CareerEvent[]>>
