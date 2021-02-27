import { Schema, model } from 'mongoose'

const threadSchema = new Schema({
  channel: String,
  thread_ts: String,
  chatLog: String,
  startedAt: Date,
})

export default model('Thread', threadSchema)
