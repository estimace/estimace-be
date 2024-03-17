import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('players', (table) => {
    table.uuid('id').unique().notNullable().primary()
    table.string('roomId', 36).notNullable()
    table
      .foreign('roomId')
      .references('rooms.id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
    table.string('name').notNullable()
    table.string('email').notNullable()
    table.boolean('isOwner').notNullable()
    table.integer('estimate')
    table.timestamp('createdAt').notNullable()
    table.timestamp('updatedAt')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('players')
}
