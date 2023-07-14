import type { Knex } from 'knex'
import dotenv from 'dotenv'

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' })

const dbType = process.env.DB_TYPE ?? 'sqlite3'
const connectionString = process.env.DB_CONNECTION_STRING as string

type Config = {
  env: string
  db: Knex.Config
  authTokenSeed: string
}

const config: Config = {
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
}

export default config
