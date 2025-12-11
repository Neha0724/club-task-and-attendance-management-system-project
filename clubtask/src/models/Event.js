import mongoose from 'mongoose'

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String },
  time: { type: String },
  location: { type: String },
  description: { type: String, default: '' },
  color: { type: String, default: 'green' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true })

export default mongoose.models.Event || mongoose.model('Event', EventSchema)
