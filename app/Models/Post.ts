import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Comment from './Comment'
import Place from './Place'
import User from './User'

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public idAutor: number

  @column()
  public idLugar: number

  @column()
  public desc: string

  @column()
  public img: string | null

  @column()
  public likes: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    localKey: 'idAutor'
  })
  public users: BelongsTo<typeof User>

  @belongsTo(() => Place, {
    localKey: 'idLugar'
  })
  public places: BelongsTo<typeof Place>

  @hasMany(() => Comment, {
    foreignKey: 'idPost'
  })
  public comments: HasMany<typeof Comment>
}
