import { AppResult } from "@/core/util/appResult"

export type UpdateCareerMapVectorCommandParameters = {
  careerMapId: string
  embedding: number[]
  tagWeights: Record<string, number>
}

export type UpdateCareerMapVectorCommand = (params: UpdateCareerMapVectorCommandParameters) => Promise<AppResult<void>>
