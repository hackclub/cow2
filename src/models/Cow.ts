import { Schema, model, Model, Document } from 'mongoose'

export interface ICow extends Document {
  currentChannel: string,
  wordsTotal: number,
  wordsToday: number
}

interface ICowModel extends Model<ICow> {
  incrementWordCount(add: number): Promise<ICow>
}

const cowSchema: Schema<ICow, ICowModel> = new Schema({
  currentChannel: String,
  wordsTotal: Number,
  wordsToday: Number
})

cowSchema.statics.incrementWordCount = async function (add: number) {
  const cow = await this.findOne()
  cow.wordsTotal = (cow.wordsTotal || 0) + add
  cow.wordsToday = (cow.wordsToday || 0) + add
  await cow.save()
  return cow
}

export default model<ICow, ICowModel>('Cow', cowSchema)
