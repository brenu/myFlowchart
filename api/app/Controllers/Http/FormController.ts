import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';

export default class FormController {
  public async store({request, response} : HttpContextContract){
    try {
      const newUserSchema = schema.create({
        username: schema.string({}, [
          rules.required(),
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

      await request.validate({
        schema: newUserSchema,
        messages: {
          'username.required': 'username~O nome de usuário é obrigatório',
          'username.unique': 'username~Nome de usuário não disponível',
          'password.required': 'password~A senha é obrigatória',
          'password.minLength': 'password~A senha deve possuir ao menos {{ options.minLength }} caracteres',
          'recovery_email.email': 'email~E-Mail inválido',
        }
      });

      return response.status(200);
    } catch (error) {
      if (error.messages && error.messages.errors) {
        return response.status(400).json({ message: error.messages.errors[0].message });
      }

      return response.status(500).json({ message: "Unknown error" });
    }

  }
}
