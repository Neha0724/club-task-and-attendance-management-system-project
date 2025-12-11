import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  position: { type: String, default: 'Member' },
  domain: { type: String, default: '' },
  memberSince: { type: Number, default: new Date().getFullYear() }
}, { timestamps: true })

export default mongoose.models.User || mongoose.model('User', UserSchema)
