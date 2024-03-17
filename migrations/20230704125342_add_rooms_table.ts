import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('rooms', (roomTable) => {
    roomTable.string('id', 36).unique().notNullable().primary()
    roomTable.integer('state').notNullable()
    roomTable.integer('technique').notNullable()
    roomTable.timestamp('createdAt').notNullable()
    roomTable.timestamp('updatedAt')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('rooms')
}
