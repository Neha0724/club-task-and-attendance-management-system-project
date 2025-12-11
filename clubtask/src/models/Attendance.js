import mongoose from 'mongoose'

const AttendanceSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['present','absent'], default: 'present' },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

AttendanceSchema.index({ event: 1, member: 1 }, { unique: true })
export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema)
