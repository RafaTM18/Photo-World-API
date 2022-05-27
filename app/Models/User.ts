import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Comment from './Comment'
import Post from './Post'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nome: string

  @column()
  public username: string

  @column()
  public password: string

  @column()
  public foto: string | null

  @column.dateTime()
  public dtNasc: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Post, {
    foreignKey: 'idAutor'
  })
  public posts: HasMany<typeof Post>

  @hasMany(() => Comment, {
    foreignKey: 'idAutor'
  })
  public comments: HasMany<typeof Comment>

}
