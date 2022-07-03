import { DateTime } from 'luxon'
import { afterCreate, BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import StudentFlowchart from './StudentFlowchart'
import StudentSubject from './StudentSubject'

export default class Subject extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public flowchart_id: number

  @column()
  public semester: number

  @column()
  public name: string

  @column()
  public code: string

  @column()
  public summary: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @afterCreate()
  public static async applyToStudents(subject: Subject) {
    const students = await StudentFlowchart.query()
      .where("flowchart_id", subject.flowchart_id);

    const studentSubjects = students.map((student) => ({
      student_id: student.id,
      subject_id: subject.id
    }));

    await StudentSubject.createMany(studentSubjects);
  }
}
