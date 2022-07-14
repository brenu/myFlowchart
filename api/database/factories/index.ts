import Factory from '@ioc:Adonis/Lucid/Factory'
import Prerequisite from 'App/Models/Prerequisite'
import Subject from 'App/Models/Subject'
import User from 'App/Models/User'

// import Factory from '@ioc:Adonis/Lucid/Factory'
export const UserFactory = Factory.define(User, ({ faker }) => {
  return {
    username: faker.internet.userName(),
    password: faker.internet.password(),
    role: 'student',
  }
}).build()

export const SubjectFactory = Factory.define(Subject, ({ faker }) => {
  return {
    name: faker.name.jobArea(),
    semester: parseInt((Math.random() * (9 - 1) + 1).toString()),
    code: `CET-${parseInt((Math.random() * (999 - 100) + 100).toString())}`,
    practical_load: parseInt((Math.random() * (120 - 0) + 0).toString()),
    theoretical_load: parseInt((Math.random() * (120 - 0) + 0).toString()),
    professor: faker.name.firstName(),
    summary: faker.lorem.paragraph(),
    objective: faker.lorem.paragraph(),
    methodology: faker.lorem.paragraph(),
    assessment: faker.lorem.paragraph(),
    flowchart_id: 1,
  }
}).build()

export const PrerequisiteFactory = Factory.define(Prerequisite, async () => {
  const isAlreadyCreated = false

  while (!isAlreadyCreated) {
    const randomValue = parseInt((Math.random() * (30 - 1) + 1).toString())

    const randomSubject = await Subject.find(randomValue)

    if (!randomSubject) {
      continue
    }

    const prerequisitesCount = await Prerequisite.query().where('subject_id', randomSubject.id)

    if (prerequisitesCount.length > 2) {
      continue
    }

    const randomDistance = getDistance()

    const availableSubjects = await Subject.query().where(
      'semester',
      randomSubject.semester - randomDistance
    )

    if (availableSubjects.length === 0) {
      continue
    }

    const randomAvailableSubject =
      availableSubjects[Math.floor(Math.random() * availableSubjects.length)]

    const doesRelationshipAlreadyExist = await Prerequisite.query()
      .where('prerequisite_id', randomAvailableSubject.id)
      .where('subject_id', randomSubject.id)
      .first()

    if (doesRelationshipAlreadyExist) {
      continue
    }

    return {
      subject_id: randomSubject.id,
      prerequisite_id: randomAvailableSubject.id,
    }
  }

  return {
    subject_id: 0,
    prerequisite_id: 0,
  }
}).build()

function getDistance() {
  const randomValue = parseInt((Math.random() * (11 - 1) + 1).toString())

  if (randomValue < 5) {
    return 1
  } else if (randomValue < 9) {
    return 2
  } else {
    return 3
  }
}
