import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Flowchart extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public coordinator_id: number

  @column()
  public name: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'coordinator_id',
    localKey: 'id'
  })
  public coordinator: BelongsTo<typeof User>
}
