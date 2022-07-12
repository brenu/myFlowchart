import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Flowchart from 'App/Models/Flowchart';
import StudentFlowchart from 'App/Models/StudentFlowchart';
import StudentSubject from 'App/Models/StudentSubject';

export default class StudentSubjectsController {
  public async index({ request, response }: HttpContextContract) {
    const user = request.session_user;

    if (user) {
      const flowcharts = await Flowchart.query()
        .innerJoin("student_flowcharts", "student_flowcharts.flowchart_id", "flowcharts.id")
        .where("student_id", user.id)
        .select(["flowcharts.id", "name"])
        .orderBy("name");

      return response.status(200).json(flowcharts);
    }

    return response.status(404);
  }

  public async store({ }: HttpContextContract) { }

  public async show({ }: HttpContextContract) { }

  public async update({ request, response }: HttpContextContract) {
    const user = request.session_user;
    const subject_id = request.param("subject-id");

    const status = request.input("status");

    if (user) {
      const studentSubjectRelationship = await StudentSubject.query()
        .where("student_id", user.id)
        .andWhere("subject_id", subject_id)
        .first();

      if (studentSubjectRelationship) {
        studentSubjectRelationship.status = status;
        await studentSubjectRelationship.save();

        return response.status(200).json({ success: true });
      }

      return response.status(404);
    }

    return response.status(404);
  }

  public async destroy({ }: HttpContextContract) { }
}
