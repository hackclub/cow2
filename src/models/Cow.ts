import { Schema, model, Model, Document } from 'mongoose'

export interface ICow extends Document {
  currentChannel: string,
  wordsTotal: number,
  wordsToday: number
}

interface ICowModel extends Model<ICow> {
  incrementWordCount(add: number): Promise<ICow>
  ensureCreated(): Promise<void>
}

const cowSchema: Schema<ICow, ICowModel> = new Schema({
  currentChannel: String,
  wordsTotal: Number,
  wordsToday: Number,
})

cowSchema.statics.incrementWordCount = async function (add: number) {
  const cow = await this.findOne()
  cow.wordsTotal = (cow.wordsTotal || 0) + add
  cow.wordsToday = (cow.wordsToday || 0) + add
  await cow.save()
  return cow
}

cowSchema.statics.ensureCreated = async function () {
  const cow = await this.findOne()
  if (!cow) await this.create({
    currentChannel: process.env.COW_HOME_CHANNEL,
    wordsTotal: 0,
    wordsToday: 0
  })
}

export default model<ICow, ICowModel>('Cow', cowSchema)
