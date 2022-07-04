import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Comment from 'App/Models/Comment';
import StudentFlowchart from 'App/Models/StudentFlowchart';
import StudentSubject from 'App/Models/StudentSubject';

export default class CommentsController {
    public async store({ request, response }: HttpContextContract) {
        const user = request.session_user;

        const subject_id = request.input("subject_id");
        const content = request.input("content");

        if (user) {
            const studentSubject = await StudentSubject.query()
                .innerJoin("subjects", "subjects.id", "student_subjects.subject_id")
                .where("student_id", user.id)
                .andWhere("subject_id", subject_id)
                .first();

            if (!studentSubject) {
                return response.status(404);
            }

            const flowchart_id = studentSubject.$extras.flowchart_id;

            const studentFlowchart = await StudentFlowchart.query()
                .where("student_id", user.id)
                .andWhere("flowchart_id", flowchart_id)
                .first();

            if (!studentFlowchart) {
                return response.status(404);
            }

            const newComment = await Comment.create({
                subject_id,
                owner_id: studentFlowchart.id,
                content
            });

            return response.status(201).json(newComment);
        }

        return response.status(404);
    }

    public async destroy({ request, response }: HttpContextContract) {
        const user = request.session_user;

        const comment_id = request.param("comment-id");

        if (user) {
            const comment = await Comment.find(comment_id);

            if (!comment) {
                return response.status(404);
            }

            const studentSubject = await StudentSubject.query()
                .innerJoin("subjects", "subjects.id", "student_subjects.subject_id")
                .where("student_id", user.id)
                .andWhere("subject_id", comment.subject_id)
                .first();

            if (!studentSubject) {
                return response.status(404);
            }

            const flowchart_id = studentSubject.$extras.flowchart_id;

            const studentFlowchart = await StudentFlowchart.query()
                .where("student_id", user.id)
                .andWhere("flowchart_id", flowchart_id)
                .first();

            if (!studentFlowchart || comment.owner_id !== studentFlowchart.id) {
                return response.status(404);
            }

            await comment.delete();

            return response.status(204);
        }

        return response.status(404);
    }
}
