import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import StudentFlowchart from 'App/Models/StudentFlowchart';

export default class PrivacySettingsController {
    public async show({ request, response }: HttpContextContract) {

        const user = request.session_user;
        const flowchart_id = request.param("flowchart-id");

        if (user && flowchart_id) {
            const studentFlowchart = await StudentFlowchart.query()
                .where("flowchart_id", flowchart_id)
                .andWhere("student_id", user.id)
                .select(["is_public", "has_public_comments"])
                .first();

            if (!studentFlowchart) {
                return response.status(404);
            }

            return response.status(200).json(studentFlowchart);
        }

        return response.status(404);
    }

    public async update({ request, response }: HttpContextContract) {
        const user = request.session_user;
        const flowchart_id = request.param("flowchart-id");

        if (user && flowchart_id) {
            try {
                const newSettingsSchema = schema.create({
                    is_public: schema.boolean([
                        rules.required()
                    ]),
                    has_public_comments: schema.boolean([
                        rules.required()
                    ]),
                });

                const settingsData = await request.validate({
                    schema: newSettingsSchema,
                    messages: {
                        'is_public.required': 'O campo "é público?" é obrigatório',
                        'has_public_comments.required': 'O campo "possui comentários públicos?" é obrigatório',
                    }
                });

                const studentFlowchart = await StudentFlowchart.query()
                    .where("flowchart_id", flowchart_id)
                    .andWhere("student_id", user.id)
                    .first();

                if (!studentFlowchart) {
                    return response.status(404);
                }

                studentFlowchart.is_public = settingsData.is_public;
                studentFlowchart.has_public_comments = settingsData.has_public_comments;
                await studentFlowchart.save()

                return response.status(200).json(studentFlowchart);
            } catch (error) {
                if (error.messages && error.messages.errors) {
                    return response.status(400).json({ message: error.messages.errors[0].message });
                }

                return response.status(500).json({ message: "Unknown error" });
            }
        }

        return response.status(404);
    }
}
