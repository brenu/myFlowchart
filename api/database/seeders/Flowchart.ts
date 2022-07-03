import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Flowchart from 'App/Models/Flowchart'
import StudentFlowchart from 'App/Models/StudentFlowchart'
import { UserFactory } from 'Database/factories'

export default class FlowchartSeeder extends BaseSeeder {
  public static developmentOnly = true

  public async run() {
    const firstCoordinator = await UserFactory
      .merge({
        username: "admin",
        password: "123456",
        role: "coordinator"
      })
      .create()

    await Flowchart.create({
      coordinator_id: firstCoordinator.id,
      name: "Ciência da Computação"
    });

    // const firstStudents = await UserFactory.createMany(10)

    // await StudentFlowchart.createMany(firstStudents.map(student => {
    //   return {
    //     student_id: student.id,
    //     flowchart_id: firstFlowchart.id
    //   }
    // }));
  }
}
