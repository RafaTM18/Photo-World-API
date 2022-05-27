import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Post from './Post'

export default class Place extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column() 
  public nome: string

  @column() 
  public desc: string

  @column() 
  public local: string

  @column()
  public img: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Post, {
    foreignKey: 'idLugar'
  })
  public posts: HasMany<typeof Post>
}
