import { DateTime } from 'luxon'
import { afterCreate, BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import Subject from './Subject'
import StudentSubject from './StudentSubject'

export default class StudentFlowchart extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public student_id: number

  @column()
  public flowchart_id: number

  @column()
  public is_public: boolean

  @column()
  public has_public_comments: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @afterCreate()
  public static async fetchSubjects(studentFlowchart: StudentFlowchart) {
    const allSubjects = await Subject.query()
      .where("flowchart_id", studentFlowchart.flowchart_id);

    const newStudentSubjects = allSubjects.map((subject) => ({
      student_id: studentFlowchart.student_id,
      subject_id: subject.id
    }));

    await StudentSubject.createMany(newStudentSubjects);
  }
}
