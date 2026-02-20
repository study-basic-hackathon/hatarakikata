import * as fs from 'fs'
import * as path from 'path'

import type { ListCareerDataQuery } from '@/core/application/port/query/careerData/listCareerDataQuery'
import { succeed } from '@/core/util/appResult'

const DATA_DIR = path.resolve(process.cwd(), 'data')

export const listCareerDataQuery: ListCareerDataQuery = async () => {
  if (!fs.existsSync(DATA_DIR)) {
    return succeed({ names: [] })
  }

  const names = fs.readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''))

  return succeed({ names })
}
