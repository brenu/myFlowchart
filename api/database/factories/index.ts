import Factory from "@ioc:Adonis/Lucid/Factory"
import User from "App/Models/User"

// import Factory from '@ioc:Adonis/Lucid/Factory'
export const UserFactory = Factory
  .define(User, ({ faker }) => {
    return {
      username: faker.internet.userName(),
      password: faker.internet.password(),
      role: "student"
    }
  })
  .build()