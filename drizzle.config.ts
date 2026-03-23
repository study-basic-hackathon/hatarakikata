import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './infrastructure/server/drizzle/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
