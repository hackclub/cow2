import { Schema, model, Model, Document } from 'mongoose'
// import { IUser } from './User'

export interface IThread extends Document {
  channel: string,
  thread_ts: string,
  chatLog: string,
  startedAt: Date,
  participants: string[]
}

const threadSchema = new Schema({
  channel: String,
  thread_ts: String,
  chatLog: String,
  startedAt: Date,
  participants: [String]
})

export default model<IThread>('Thread', threadSchema)
