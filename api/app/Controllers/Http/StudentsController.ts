import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import StudentFlowchart from 'App/Models/StudentFlowchart';
import User from 'App/Models/User';

export default class StudentsController {
  public async index({}: HttpContextContract) {}

  public async store({request, response}: HttpContextContract) {
    try {
      const newUserSchema = schema.create({
        username: schema.string({}, [
          rules.required(),
          rules.unique({table: 'users', column: 'username'})
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

      if(flowchartIds && flowchartIds.length){
        for(let id of flowchartIds) {
          const flowchart = await StudentFlowchart.find(id)

          if(flowchart) {
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
        return response.status(400).json({message: error.messages.errors[0].message});
      }

      return response.status(500).json({message: "Unknown error"});
    }
  }

  public async show({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
