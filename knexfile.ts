import type { Knex } from 'knex'
import appConfig from 'app/config'

export const config: Record<string, Knex.Config> = {
  [appConfig.env]: appConfig.db,
}

export default config
