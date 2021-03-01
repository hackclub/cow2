import { Schema, model, Model, Document } from 'mongoose'

export interface IChannel extends Document {
  channelId: string
  cowAllowed: boolean
}

const channelSchema: Schema = new Schema({
  channelId: String,
  cowAllowed: Boolean
})

export default model<IChannel>('Channel', channelSchema)
