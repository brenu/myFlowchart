import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Flowchart from 'App/Models/Flowchart';
import User from 'App/Models/User';

export default class CoordinatorsController {
  public async index({}: HttpContextContract) {}

  public async store({request, response}: HttpContextContract) {
    try {
      const newUserSchema = schema.create({
        username: schema.string({}, [
          rules.required(),
          rules.maxLength(30),
          rules.usernameValidation(),
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

      const newFlowchartSchema = schema.create({
        flowchartName: schema.string({}, [
          rules.required(),
          rules.unique({table: 'flowcharts', column: 'name'})
        ])
      });

      const userData = await request.validate({
        schema: newUserSchema,
        messages: {
          'username.required': 'username~O nome de usuário é obrigatório',
          'username.unique': 'username~Nome de usuário não disponível',
          'username.maxLength': 'username~O nome de usuário deve possuir, no máximo, 30 caracteres',
          'password.required': 'password~A senha é obrigatória',
          'password.minLength': 'password~A senha deve possuir ao menos {{ options.minLength }} caracteres',
          'recovery_email.email': 'email~E-Mail inválido',
          'recovery_email.required':'email~O e-mail é obrigatório'
        }
      });

      const flowchartData = await request.validate({
        schema: newFlowchartSchema,
        messages: {
          'flowchartName.required': 'Informe um nome para o curso',
          'flowchartName.unique': 'Já existe um curso com o mesmo nome'
        }
      });

      const newCoordinator = await User.create({
        ...userData,
        role: "coordinator"
      });

      const newFlowchart = await Flowchart.create({
        name: flowchartData.flowchartName,
        coordinator_id: newCoordinator.id
      });

      newCoordinator["flowchart_id"] = newFlowchart.id;

      return response.status(201).json({
        username: newCoordinator.username,
        id: newCoordinator.id
      });

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
