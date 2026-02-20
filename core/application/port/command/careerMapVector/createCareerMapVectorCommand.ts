import { AppResult } from "@/core/util/appResult"

export type CreateCareerMapVectorCommandParameters = {
  careerMapId: string
  embedding: number[]
  tagWeights: Record<string, number>
}

export type CreateCareerMapVectorCommand = (params: CreateCareerMapVectorCommandParameters) => Promise<AppResult<void>>
