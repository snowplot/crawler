import { Document, model, Model, Schema } from 'mongoose'

export interface ILight extends Document {
  stationNumber: string
  status: 'on' | 'off'
  updatedAt: Date
}

export const LightSchema: Schema = new Schema({
  stationNumber: {
    type: String,
    index: true
  },
  status: {
    type: String,
    enum: [
      'on',
      'off'
    ]
  },
  updatedAt: {
    type: Date,
    index: true
  }
})
LightSchema.index({ stationNumber: 1, updatedAt: 1 }, { unique: true })

export const Light: Model<ILight> = model('Light', LightSchema)
export default Light
