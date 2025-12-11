import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(req) {
  try {
    await dbConnect()
    const body = await req.json()
    const { name, email, password, position, domain } = body
    if (!name || !email || !password) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 })

    const existing = await User.findOne({ email })
    if (existing) return new Response(JSON.stringify({ error: 'Email already used' }), { status: 409 })

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = new User({ name, email, passwordHash, position, domain, memberSince: new Date().getFullYear() })
    await user.save()

    const role = (user.position && user.position.toLowerCase().includes('lead')) ? 'lead' : 'member'
    const token = signToken({ id: user._id, email: user.email, role })

    return new Response(JSON.stringify({ user: { id: user._id, name: user.name, email: user.email, position: user.position, domain: user.domain }, token }), { status: 201 })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
