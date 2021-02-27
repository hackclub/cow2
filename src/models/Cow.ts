import { Schema, model, Model, Document } from 'mongoose'

class ICow extends Document {
  currentChannel: string
}

const cowSchema = new Schema({
  currentChannel: String
})

// cowSchema.statics.getOrCreate = async function getOrCreate() {
//   const cow = await this.findOne({})
//   if (!cow) return await this.create({ currentChannel: process.env.COW_HOME_CHANNEL })
// }

const Cow: Model<ICow> = model('Cow', cowSchema)

export default Cow
