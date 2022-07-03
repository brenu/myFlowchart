import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import StudentSubject from 'App/Models/StudentSubject';

export default class StudentSubjectsController {
  public async index({ }: HttpContextContract) { }

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
