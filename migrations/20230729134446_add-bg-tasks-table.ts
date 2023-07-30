import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('bgTasks', (bgTasksTable) => {
    bgTasksTable.string('name').unique().primary().notNullable()
    bgTasksTable.boolean('isLocked').notNullable()
    bgTasksTable.timestamp('createdAt').notNullable()
    bgTasksTable.timestamp('updatedAt')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('bgTasks')
}
