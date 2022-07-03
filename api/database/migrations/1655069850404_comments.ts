import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Comments extends BaseSchema {
  protected tableName = 'comments'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('subject_id').notNullable()
      table.integer('owner_id').notNullable()
      table.string('content').notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.foreign('subject_id').references('id').inTable('subjects');
      table.foreign('owner_id').references('id').inTable('student_flowcharts');
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
