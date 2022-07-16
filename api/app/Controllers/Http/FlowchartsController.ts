import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Comment from 'App/Models/Comment'
import Flowchart from 'App/Models/Flowchart'
import StudentFlowchart from 'App/Models/StudentFlowchart'
import Subject from 'App/Models/Subject'
import User from 'App/Models/User'

export default class FlowchartsController {
  public async index({ response }: HttpContextContract) {
    const flowcharts = await Flowchart.query().select(['id', 'name']).orderBy('name')

    return response.status(200).json(flowcharts)
  }

  public async show({ request, response }: HttpContextContract) {
    const studentId = request.param('student-id')
    const flowchartId = request.param('flowchart-id')

    const flowchart = await Flowchart.find(flowchartId)

    if (!flowchart) {
      return response.status(404)
    }

    const student = await User.find(studentId)

    if (!student) {
      return response.status(404)
    }

    const studentFlowchart = await StudentFlowchart.query()
      .where('student_id', studentId)
      .andWhere('flowchart_id', flowchartId)
      .first()

    if (!studentFlowchart) {
      return response.status(404)
    }

    if (!studentFlowchart.is_public) {
      return response.status(404)
    }

    const semesters = await Subject.query()
      .select('semester')
      .where('flowchart_id', flowchart.id)
      .andWhere('is_archived', false)
      .groupBy('semester')
      .orderBy('semester')

    const subjects: object = {}

    for (let item of semesters) {
      subjects[item.$original.semester] = (
        await Database.rawQuery(`SELECT
                subjects.id, name, code, summary, status, is_archived, theoretical_load,
                practical_load, professor, objective, methodology, assessment
                FROM subjects
                INNER JOIN student_subjects ON subjects.id = student_subjects.subject_id
                WHERE student_subjects.student_id = ${studentId}
                AND semester = ${item.$original.semester}
                ORDER BY name
              `)
      ).rows

      for (let subject of subjects[item.$original.semester]) {
        const prerequisites = await Database.rawQuery(`
                  SELECT code FROM prerequisites
                  INNER JOIN subjects ON subjects.id = prerequisites.prerequisite_id
                  WHERE prerequisites.subject_id = ${subject.id}
                  AND subjects.id != ${subject.id}
                `)

        subject.comments = []
        subject.prerequisites = await prerequisites.rows.map(
          (prerequisite: Subject) => prerequisite.code
        )

        if (studentFlowchart.has_public_comments) {
          const comments = await Comment.query()
            .select(['content', 'created_at'])
            .where('subject_id', subject.id)
            .andWhere('owner_id', studentFlowchart.id)

          subject.comments = comments
        }
      }
    }

    return response.status(200).json({
      flowchart_name: flowchart.name,
      student_id: studentId,
      username: student.username,
      subjects,
    })
  }
}
