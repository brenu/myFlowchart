import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules} from '@ioc:Adonis/Core/Validator';

export default class FormController {
  public async store({request, response} : HttpContextContract){
    try {
      const newUserSchema = schema.create({
        username: schema.string({}, [
          rules.required(),
          rules.maxLength(30),
          rules.usernameValidation(),
          rules.unique({ table: 'users', column: 'username' })
        ]),
        recovery_email: schema.string({}, [
          rules.required(),
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
          'username.maxLength': 'username~O nome de usuário deve possuir, no máximo, 30 caracteres',
          'password.required': 'password~A senha é obrigatória',
          'password.minLength': 'password~A senha deve possuir ao menos {{ options.minLength }} caracteres',
          'recovery_email.email': 'email~E-Mail inválido',
          'recovery_email.required':'email~O e-mail é obrigatório'
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
