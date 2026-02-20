import * as fs from 'fs'
import * as path from 'path'

import type { SaveCareerDataCommand } from '@/core/application/port/command/careerData/saveCareerDataCommand'
import { failAsExternalServiceError, succeed } from '@/core/util/appResult'

const DATA_DIR = path.resolve(process.cwd(), 'data')

export const saveCareerDataCommand: SaveCareerDataCommand = async (data) => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

    const filePath = path.join(DATA_DIR, `${data.personName}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')

    return succeed({ filePath })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
