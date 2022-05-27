import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Post from './Post'
import User from './User'

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column() 
  public idAutor: number

  @column()
  public idPost: number

  @column()
  public text: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Post, {
    localKey: 'idPost'
  })
  public posts: BelongsTo<typeof Post>

  @belongsTo(() => User, {
    localKey: 'idAutor'
  })
  public users: BelongsTo<typeof User>
}
