import type { CareerMapSnapshot } from "@/core/domain/value/careerMapSnapshot"
import type { AppResult } from "@/core/util/appResult"

export type ReadCareerMapSnapshotQuery = (filePath: string) => Promise<AppResult<CareerMapSnapshot>>
