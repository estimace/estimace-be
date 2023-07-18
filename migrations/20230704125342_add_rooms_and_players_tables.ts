import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('rooms', (roomTable) => {
      roomTable.uuid('id').unique().notNullable().primary()
      roomTable.integer('state').notNullable()
      roomTable.integer('technique').notNullable()
      roomTable.integer('createdAt').notNullable()
      roomTable.integer('updatedAt')
    })
    .createTable('players', (playersTable) => {
      playersTable.uuid('id').unique().notNullable().primary()
      playersTable.uuid('roomId').notNullable()
      playersTable
        .foreign('roomId')
        .references('rooms.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      playersTable.string('name').notNullable()
      playersTable.string('email').notNullable()
      playersTable.boolean('isOwner').notNullable()
      playersTable.integer('estimate')
      playersTable.integer('createdAt').notNullable()
      playersTable.integer('updatedAt')
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('players').dropTable('rooms')
}
