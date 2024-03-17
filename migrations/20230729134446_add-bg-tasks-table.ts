import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('bgTasks', (table) => {
    table.string('name').unique().primary().notNullable()
    table.boolean('isLocked').notNullable()
    table.timestamp('createdAt').notNullable()
    table.timestamp('updatedAt')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('bgTasks')
}
