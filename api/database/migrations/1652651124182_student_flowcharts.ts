import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class StudentFlowcharts extends BaseSchema {
  protected tableName = 'student_flowcharts'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('student_id').notNullable()
      table.integer('flowchart_id').notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.foreign('student_id').references('id').inTable('users');
      table.foreign('flowchart_id').references('id').inTable('flowcharts');
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
