import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(req) {
  try {
    await dbConnect()
    const { email, password } = await req.json()
    if (!email || !password) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 })

    const user = await User.findOne({ email })
    if (!user) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })

    const role = (user.position && user.position.toLowerCase().includes('lead')) ? 'lead' : 'member'
    const token = signToken({ id: user._id, email: user.email, role })

    return new Response(JSON.stringify({ user: { id: user._id, name: user.name, email: user.email, position: user.position, domain: user.domain }, token }), { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
