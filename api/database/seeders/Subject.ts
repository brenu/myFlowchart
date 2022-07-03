import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Prerequisite from 'App/Models/Prerequisite'
import { PrerequisiteFactory, SubjectFactory } from 'Database/factories'

export default class SubjectSeeder extends BaseSeeder {
  public async run() {
    await SubjectFactory.createMany(30)

    await PrerequisiteFactory.createMany(10);
  }
}
