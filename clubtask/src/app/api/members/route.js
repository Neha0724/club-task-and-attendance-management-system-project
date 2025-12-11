import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(req) {
  try {
    await dbConnect()
    const url = new URL(req.url)
    const domain = url.searchParams.get('domain')
    const q = domain ? { domain } : {}
    const users = await User.find(q).select('name email position domain').lean()
    return new Response(JSON.stringify(users), { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
