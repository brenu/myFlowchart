import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database';
import Flowchart from 'App/Models/Flowchart';
import Prerequisite from 'App/Models/Prerequisite';
import Subject from 'App/Models/Subject';

export default class CoordinatorSubjectsController {
  public async index({ request, response }: HttpContextContract) {
    const user = request.session_user;

    if (user) {
      const flowchart = await Flowchart.query()
        .where("coordinator_id", user.id)
        .first();

      if (!flowchart) {
        return response.status(404);
      }

      const semesters = await Subject.query()
        .select("semester")
        .where("flowchart_id", flowchart.id)
        .andWhere("is_archived", false)
        .groupBy("semester")
        .orderBy("semester");

      const subjects: object = {};

      for (let item of semesters) {
        subjects[item.$original.semester] = await Subject.query()
          .select(["id", "summary", "name", "semester", "code"])
          .where("flowchart_id", flowchart.id)
          .andWhere("semester", item.$original.semester)
          .andWhere("is_archived", false);

        for (let [index, subject] of subjects[item.$original.semester].entries()) {
          subject = subject["$original"];

          const prerequisites = await Database.rawQuery(`
              SELECT code FROM prerequisites
              INNER JOIN subjects ON subjects.id = prerequisites.prerequisite_id
              WHERE prerequisites.subject_id = ${subject.id}
              AND subjects.id != ${subject.id}
            `);

          subject["prerequisites"] = prerequisites.rows.map((prerequisite: Subject) => prerequisite.code);
          subjects[item.$original.semester][index] = subject;
        }
      }

      return response.status(200).json({
        flowchart_id: flowchart.id,
        flowchart_name: flowchart.name,
        subjects,
      });
    }

    return response.status(404);
  }

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

  public async update({ request, response }: HttpContextContract) {
    const user = request.session_user;
    const subject_id = request.param("subject-id");

    if (user) {
      const subject = await Subject.find(subject_id);

      if (!subject) {
        return response.status(404);
      }

      const flowchart = await Flowchart.query()
        .where("id", subject.flowchart_id)
        .andWhere("coordinator_id", user.id);

      if (!flowchart) {
        return response.status(404);
      }

      const subjectSchema = schema.create({
        name: schema.string({}, [
          rules.required(),
        ]),
        summary: schema.string(),
        semester: schema.number(),
      });

      const subjectData = await request.validate({
        schema: subjectSchema,
        messages: {
          'name.required': 'O nome é obrigatório',
          'summary.required': 'A descrição é obrigatória',
          'semester.required': 'O semestre é obrigatório',
        }
      });

      subject.merge(subjectData);
      await subject.save();

      const prerequisites = (await request.validate({
        schema: schema.create({ prerequisites: schema.array().members(schema.string()) })
      })).prerequisites;

      const validPrerequisites = await Subject.query()
        .whereIn("code", prerequisites)
        .andWhere("semester", "<", subject.semester);

      const presentSubjectPrerequisites = await Prerequisite.query()
        .where("subject_id", subject.id);

      const prerequisitesToBeAdded: object[] = [];
      for (const prerequisite of validPrerequisites) {
        if (!presentSubjectPrerequisites.some(item => item.prerequisite_id === prerequisite.id)) {
          prerequisitesToBeAdded.push({
            subject_id: subject.id,
            prerequisite_id: prerequisite.id
          });
        }
      }

      for (const presentSubjectPrerequisite of presentSubjectPrerequisites) {
        if (!validPrerequisites.some(item => item.id === presentSubjectPrerequisite.prerequisite_id)) {
          await presentSubjectPrerequisite.delete();
        }
      }

      await Prerequisite.createMany(prerequisitesToBeAdded);

      const finalPrerequisites = await Subject.query()
        .innerJoin("prerequisites", "prerequisites.prerequisite_id", "subjects.id")
        .where("subject_id", subject.id)
        .select("code");

      return response.status(200).json({
        ...subject.$original,
        prerequisites: finalPrerequisites.map(item => item.code)
      });
    }

    return response.status(404);
  }

  public async destroy({ request, response }: HttpContextContract) {
    const user = request.session_user;
    const subject_id = request.param("subject-id");

    if (user) {
      const subject = await Subject.find(subject_id);

      if (!subject) {
        return response.status(404);
      }

      const flowchart = await Flowchart.query()
        .where("id", subject.flowchart_id)
        .andWhere("coordinator_id", user.id);

      if (!flowchart) {
        return response.status(404);
      }

      subject.is_archived = true;
      await subject.save();

      await Prerequisite.query()
        .where("prerequisite_id", subject.id)
        .delete();

      return response.status(204);
    }

    return response.status(404);
  }
}
