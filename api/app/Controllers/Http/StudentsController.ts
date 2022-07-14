import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import Comment from 'App/Models/Comment'
import Flowchart from 'App/Models/Flowchart'
import StudentFlowchart from 'App/Models/StudentFlowchart'
import Subject from 'App/Models/Subject'
import User from 'App/Models/User'

export default class StudentsController {
  public async index({}: HttpContextContract) {}

  public async store({ request, response }: HttpContextContract) {
    try {
      const newUserSchema = schema.create({
        username: schema.string({}, [
          rules.required(),
          rules.unique({ table: 'users', column: 'username' }),
        ]),
        recovery_email: schema.string({}, [rules.email(), rules.required()]),
        password: schema.string({}, [rules.required(), rules.minLength(6)]),
      })

      const userData = await request.validate({
        schema: newUserSchema,
        messages: {
          'username.required': 'O nome de usuário é obrigatório',
          'password.required': 'A senha é obrigatória',
          'username.unique': 'Nome de usuário não disponível',
          'password.minLength': 'A senha deve possuir ao menos {{ options.minLength }} caracteres',
          'recovery_email.email': 'E-Mail inválido',
          'recovery_email.required': 'O e-mail é obrigatório',
        },
      })

      const newStudent = await User.create(userData)

      const flowchartIds = request.input('flowchart_ids')

      if (flowchartIds && flowchartIds.length) {
        for (let id of flowchartIds) {
          const flowchart = await Flowchart.find(id)

          if (flowchart) {
            StudentFlowchart.create({
              student_id: newStudent.id,
              flowchart_id: id,
            })
          }
        }
      }

      return response.status(201).json(newStudent)
    } catch (error) {
      if (error.messages && error.messages.errors) {
        return response.status(400).json({ message: error.messages.errors[0].message })
      }

      return response.status(500).json({ message: 'Unknown error' })
    }
  }

  public async show({ request, response }: HttpContextContract) {
    const user = request.session_user
    const flowchart_id = request.param('flowchart-id')

    if (user) {
      const flowcharts = await user.related('flowcharts').query()

      if (flowcharts.length) {
        for (let flowchart of flowcharts) {
          if (flowchart.id === parseInt(flowchart_id)) {
            const student_flowchart = await StudentFlowchart.query()
              .where('flowchart_id', flowchart.id)
              .andWhere('student_id', user.id)
              .first()

            if (!student_flowchart) {
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
                subjects.id, name, code, summary, status, is_archived
                FROM subjects
                INNER JOIN student_subjects ON subjects.id = student_subjects.subject_id
                WHERE student_subjects.student_id = ${user.id}
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

                const comments = await Comment.query()
                  .select(['content', 'created_at'])
                  .where('subject_id', subject.id)
                  .andWhere('owner_id', student_flowchart.id)

                subject.prerequisites = await prerequisites.rows.map(
                  (prerequisite: Subject) => prerequisite.code
                )

                subject.comments = comments
              }
            }

            return response.status(200).json({
              flowchart_name: flowchart.name,
              student_id: user.id,
              username: user.username,
              subjects,
            })
          }
        }
      }
    }

    return response.status(404).json(user)
  }

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
