import dbConnect from '@/lib/mongodb'
import Event from '@/models/Event'
import { getUserFromReq } from '@/lib/getUserFromReq'

export async function GET(req) {
  try {
    await dbConnect()
    const events = await Event.find({}).sort({ createdAt: -1 }).lean()
    return new Response(JSON.stringify(events), { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}

export async function POST(req) {
  try {
    await dbConnect()
    const { payload, error } = getUserFromReq(req)
    if (error) return new Response(JSON.stringify({ error }), { status: 401 })

    // only lead can create events
    if (payload.role !== 'lead') return new Response(JSON.stringify({ error: 'Only lead can create events' }), { status: 403 })

    const data = await req.json()
    const ev = new Event({ ...data, createdBy: payload.id })
    await ev.save()
    return new Response(JSON.stringify(ev), { status: 201 })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    await dbConnect()
    const { payload, error } = getUserFromReq(req)
    if (error) return new Response(JSON.stringify({ error }), { status: 401 })
    if (payload.role !== 'lead') return new Response(JSON.stringify({ error: 'Only lead can delete events' }), { status: 403 })

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 })

    await Event.findByIdAndDelete(id)
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
