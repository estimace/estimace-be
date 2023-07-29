import type { Knex } from 'knex'
import dotenv from 'dotenv'

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' })

const dbType = process.env.DB_TYPE ?? 'sqlite3'
const connectionString = process.env.DB_CONNECTION_STRING as string

type Config = {
  port: number
  env: string
  db: Knex.Config
  authTokenSeed: string
  verbose: boolean
  playersPerRoomLimit: number
}

const config: Config = {
  port: parseNumber(process.env.PORT, 0),
  env: process.env.NODE_ENV ?? 'development',
  db: {
    client: dbType,
    connection: connectionString,
    pool: {
      min: (process.env.DB_POOL_MIN ?? 2) as number,
      max: (process.env.DB_POOL_MAX ?? 10) as number,
    },
    migrations: {
      directory: './migrations',
      tableName: 'db_migrations',
    },
    useNullAsDefault: true,
    debug: process.env.DB_DEBUG === 'true',
  },
  authTokenSeed: process.env.AUTH_TOKEN_SEED as string,
  verbose: process.env.VERBOSE === 'true',
  playersPerRoomLimit: parseNumber(process.env.PLAYERS_PER_ROOM_LIMIT, 30),
}

function parseNumber(value: string | undefined, fallback: number) {
  const parsedValue = Number(value)
  if (isNaN(parsedValue)) {
    return fallback
  }
  return parsedValue
}

export default config
