import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class StudentSubjects extends BaseSchema {
  protected tableName = 'student_subjects'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('student_id').notNullable()
      table.integer('subject_id').notNullable()
      table.enu('status', ['todo','doing','done']).defaultTo('todo')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.foreign('student_id').references('id').inTable('users');
      table.foreign('subject_id').references('id').inTable('subjects');
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
