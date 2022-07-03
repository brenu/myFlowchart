import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import Database from '@ioc:Adonis/Lucid/Database';
import StudentFlowchart from 'App/Models/StudentFlowchart';
import Subject from 'App/Models/Subject';
import User from 'App/Models/User';

export default class StudentsController {
  public async index({ }: HttpContextContract) { }

  public async store({ request, response }: HttpContextContract) {
    try {
      const newUserSchema = schema.create({
        username: schema.string({}, [
          rules.required(),
          rules.unique({ table: 'users', column: 'username' })
        ]),
        recovery_email: schema.string.optional({}, [
          rules.email()
        ]),
        password: schema.string({}, [
          rules.required(),
          rules.minLength(6),
        ])
      });

      const userData = await request.validate({
        schema: newUserSchema,
        messages: {
          'username.required': 'O nome de usuário é obrigatório',
          'password.required': 'A senha é obrigatória',
          'username.unique': 'Nome de usuário não disponível',
          'password.minLength': 'A senha deve possuir ao menos {{ options.minLength }} caracteres',
          'recovery_email.email': 'E-Mail inválido',
        }
      });

      const newStudent = await User.create(userData);

      const flowchartIds = request.input("flowchart_ids");

      if (flowchartIds && flowchartIds.length) {
        for (let id of flowchartIds) {
          const flowchart = await StudentFlowchart.find(id)

          if (flowchart) {
            StudentFlowchart.create({
              student_id: newStudent.id,
              flowchart_id: id
            });
          }
        }

      }

      return response.status(201).json(newStudent);
    } catch (error) {
      if (error.messages && error.messages.errors) {
        return response.status(400).json({ message: error.messages.errors[0].message });
      }

      return response.status(500).json({ message: "Unknown error" });
    }
  }

  public async show({ request, response }: HttpContextContract) {
    const user = request.session_user;
    const flowchart_id = request.param("flowchart-id");

    if (user) {
      const flowcharts = await user.related('flowcharts').query();

      if (flowcharts.length) {
        // console.log(flowcharts);
        for (let flowchart of flowcharts) {
          if (flowchart.id === parseInt(flowchart_id)) {
            const subjects = await Database.rawQuery(`SELECT
              subjects.id, name, code, summary, status
              FROM subjects
              INNER JOIN student_subjects ON subjects.id = student_subjects.subject_id
              WHERE student_subjects.student_id = ${user.id}
            `);

            for (let subject of subjects.rows) {
              const prerequisites = await Database.rawQuery(`
                SELECT code FROM prerequisites
                INNER JOIN subjects ON subjects.id = prerequisites.prerequisite_id
                WHERE prerequisites.subject_id = ${subject.id}
                AND subjects.id != ${subject.id}
              `);

              subject.prerequisites = await prerequisites.rows.map((prerequisite: Subject) => prerequisite.code);
            }

            return response.status(200).json(subjects.rows);
          }
        }
      }
    }

    return response.status(404).json(user);
  }

  public async update({ }: HttpContextContract) { }

  public async destroy({ }: HttpContextContract) { }
}
