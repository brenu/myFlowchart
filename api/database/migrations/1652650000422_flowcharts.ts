import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Flowcharts extends BaseSchema {
  protected tableName = 'flowcharts'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('coordinator_id').notNullable()
      table.string('name', 255).notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.foreign('coordinator_id').references('id').inTable('users');
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
