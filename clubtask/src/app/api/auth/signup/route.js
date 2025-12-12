import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(req) {
  try {
    console.log('[SIGNUP] request at', new Date().toISOString())
    await dbConnect()
    const body = await req.json().catch(e => {
      console.error('[SIGNUP] failed to parse JSON body', e)
      return null
    })
    if (!body) return new Response(JSON.stringify({ error: 'Invalid or empty JSON body' }), { status: 400 })

    const name = (body.name || '').toString().trim()
    const email = (body.email || '').toString().trim().toLowerCase()
    const password = (body.password || '').toString()
    const position = (body.position || '').toString()
    const domain = (body.domain || '').toString()

    if (!name || !email || !password) {
      console.warn('[SIGNUP] missing fields', { name: !!name, email: !!email, password: !!password })
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 })
    }

    // check existing
    const existing = await User.findOne({ email })
    if (existing) {
      console.warn('[SIGNUP] email already used', email)
      return new Response(JSON.stringify({ error: 'Email already used' }), { status: 409 })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = new User({ name, email, passwordHash, position, domain, memberSince: new Date().getFullYear() })
    await user.save()

    const role = (user.position && user.position.toLowerCase().includes('lead')) ? 'lead' : 'member'
    const token = signToken({ id: user._id, email: user.email, role })

    const userResp = { id: user._id, name: user.name, email: user.email, position: user.position, domain: user.domain }
    console.log('[SIGNUP] created user', email, 'role:', role)
    return new Response(JSON.stringify({ user: userResp, token }), { status: 201 })
  } catch (err) {
    console.error('[SIGNUP] unexpected error', err && err.stack ? err.stack : err)
    // detect common mongoose validation / duplicate error
    if (err && err.code === 11000) {
      return new Response(JSON.stringify({ error: 'Duplicate key error' }), { status: 409 })
    }
    return new Response(JSON.stringify({ error: 'Server error', details: String(err && err.message ? err.message : err) }), { status: 500 })
  }
}