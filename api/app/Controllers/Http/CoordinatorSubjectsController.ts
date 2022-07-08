import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Flowchart from 'App/Models/Flowchart';
import Prerequisite from 'App/Models/Prerequisite';
import Subject from 'App/Models/Subject';

export default class CoordinatorSubjectsController {
  public async index({ }: HttpContextContract) { }

  public async store({ request, response }: HttpContextContract) {
    const user = request.session_user;

    if (user) {
      try {
        const flowchart = await Flowchart.findBy("coordinator_id", user.id);

        if (!flowchart) {
          return response.status(404);
        }

        const newSubjectSchema = schema.create({
          name: schema.string({}, [
            rules.required(),
            rules.unique({ table: 'subjects', column: 'name' })
          ]),
          code: schema.string({}, [
            rules.required(),
            rules.unique({ table: 'subjects', column: 'code' }),
            rules.maxLength(10)
          ]),
          summary: schema.string(),
          semester: schema.number(),
        });

        const subjectData = await request.validate({
          schema: newSubjectSchema,
          messages: {
            'name.required': 'O nome é obrigatório',
            'code.required': 'O código é obrigatório',
            'name.unique': 'Nome não disponível',
            'code.unique': 'Código não disponível',
            'code.maxLength': 'O código deve possuir até {{ options.maxLength }} caracteres',
            'summary.required': 'A descrição é obrigatória',
            'semester.required': 'O semestre é obrigatório',
          }
        });

        const prerequisites = (await request.validate({
          schema: schema.create({ prerequisites: schema.array().members(schema.string()) })
        })).prerequisites;

        const newSubject = await Subject.create({
          ...subjectData,
          flowchart_id: flowchart.id
        });

        const validPrerequisites = await Subject.query()
          .whereIn("code", prerequisites)
          .andWhere("semester", "<", newSubject.semester);

        const newPrerequisites = validPrerequisites.map(prerequisite => ({ subject_id: newSubject.id, prerequisite_id: prerequisite.id }));

        await Prerequisite.createMany(newPrerequisites);

        return response.status(201).json({
          ...newSubject.$original,
          prerequisites: validPrerequisites.map(item => item.code)
        });
      } catch (error) {
        if (error.messages && error.messages.errors) {
          return response.status(400).json({ message: error.messages.errors[0].message });
        }

        return response.status(500).json({ message: "Unknown error" });
      }
    }

    return response.status(404);
  }

  public async show({ }: HttpContextContract) { }

  public async update({ }: HttpContextContract) { }

  public async destroy({ }: HttpContextContract) { }
}
