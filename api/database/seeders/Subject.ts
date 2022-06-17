import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { SubjectFactory } from 'Database/factories'

export default class SubjectSeeder extends BaseSeeder {
  public async run () {
    await SubjectFactory.createMany(30)
  }
}
