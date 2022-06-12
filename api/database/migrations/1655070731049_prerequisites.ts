import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Prerequisites extends BaseSchema {
  protected tableName = 'prerequisites'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('subject_id').notNullable()
      table.integer('prerequisite_id').notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.foreign('subject_id').references('id').inTable('subjects');
      table.foreign('prerequisite_id').references('id').inTable('subjects');
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
