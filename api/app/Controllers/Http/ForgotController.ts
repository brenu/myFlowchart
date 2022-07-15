import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'
import Mail from '@ioc:Adonis/Addons/Mail'
const uuid = require('uuid')

export default class ForgotController {
  public async store({ request, response }: HttpContextContract) {
    const username = request.input('username')

    if (username) {
      const user = await User.findBy('username', username)

      if (user && user.recovery_email) {
        const token = uuid.v4()
        user.rememberMeToken = token
        await user.save()

        await Mail.use('smtp').send((message) => {
          message
            .from(Env.get('SMTP_USERNAME'))
            .to(user.recovery_email)
            .subject('Recuperação de senha').html(`
              <h1>Olá, ${user.username}!</h1>
              <br/><br/><br/><br/>
              <p>Para recuperar sua senha, <a href="https://${Env.get(
                'FRONTEND_HOST'
              )}/resetPassword/${token}">Clique aqui!</a></p>
            `)
        })
      }
    }

    return response.status(201).json({ success: true })
  }

  public async update({ request, response }: HttpContextContract) {
    try {
      const token = request.param('token')

      const bodySchema = schema.create({
        password: schema.string({}, [rules.required(), rules.minLength(6)]),
      })

      const bodyData = await request.validate({
        schema: bodySchema,
        messages: {
          'password.required': 'É necessário informar uma senha',
          'password.minLength': 'A senha deve possuir ao menos {{ options.minLength }} caracteres',
        },
      })

      if (token) {
        const user = await User.findBy('rememberMeToken', token)

        if (user) {
          user.password = bodyData.password
          user.rememberMeToken = ''
          await user.save()

          return response.status(200).json({ success: true })
        }

        return response.status(400).json({ message: 'Houve um erro durante a operação' })
      }

      return response.status(404).json({ message: 'Nenhum token informado' })
    } catch (error) {
      if (error.messages && error.messages.errors) {
        return response.status(400).json({ message: error.messages.errors[0].message })
      }

      return response.status(500).json({ message: 'Unknown error' })
    }
  }
}
