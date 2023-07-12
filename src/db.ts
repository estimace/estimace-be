import knex from 'knex'
import config from 'app/config'

export const db = knex(config.db)
