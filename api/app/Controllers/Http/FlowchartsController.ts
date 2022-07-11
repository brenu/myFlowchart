import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Flowchart from 'App/Models/Flowchart'

export default class FlowchartsController {
    public async index({ response }: HttpContextContract) {
        const flowcharts = await Flowchart.query()
            .select(["id", "name"])
            .orderBy("name");

        return response.status(200).json(flowcharts);
    }
}
