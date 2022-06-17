import Factory from "@ioc:Adonis/Lucid/Factory"
import Subject from "App/Models/Subject"
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

export const SubjectFactory = Factory
  .define(Subject, ({ faker }) => {
    return {
      name: faker.name.jobArea(),
      semester: parseInt((Math.random() * (9 - 1) + 1).toString()),
      code: `CET-${parseInt((Math.random() * (999 - 100) + 100).toString())}`,
      summary: faker.lorem.paragraph(),
      flowchart_id: 1
    }
  })
  .build()