import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Subjects extends BaseSchema {
  protected tableName = 'subjects'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('flowchart_id').notNullable()
      table.integer('semester').notNullable()
      table.string('name', 50).notNullable()
      table.string('code', 10).notNullable()
      table.text('summary').notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.foreign('flowchart_id').references('id').inTable('flowcharts');
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
