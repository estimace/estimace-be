import type { Knex } from 'knex'
import appConfig from 'app/config'

const config: Record<string, Knex.Config> = {
  [appConfig.env]: appConfig.db,
}

module.exports = config
