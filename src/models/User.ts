import { Schema, model, Model, Document } from 'mongoose'

export interface IUser extends Document {
  slackId: string
  wordsTotal: number
}

const userSchema: Schema = new Schema({
  slackId: String,
  wordsTotal: Number
})

export default model<IUser>('User', userSchema)
