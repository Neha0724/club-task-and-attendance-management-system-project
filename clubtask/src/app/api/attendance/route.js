import dbConnect from '@/lib/mongodb'
import Attendance from '@/models/Attendance'
import { getUserFromReq } from '@/lib/getUserFromReq'
import mongoose from 'mongoose'

export async function POST(req) {
  try {
    await dbConnect()
    const { payload, error } = getUserFromReq(req)
    if (error) return new Response(JSON.stringify({ error }), { status: 401 })

    const body = await req.json()
    const { eventId, memberId, status, attendance } = body

    if (attendance && typeof attendance === 'object') {
      const results = []
      for (const [mId, s] of Object.entries(attendance)) {
        if (!mongoose.Types.ObjectId.isValid(mId)) continue
        const rec = await Attendance.findOneAndUpdate(
          { event: eventId, member: mId },
          { status: s, markedBy: payload.id },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
        results.push(rec)
      }
      return new Response(JSON.stringify(results), { status: 200 })
    }

    if (!eventId || !memberId) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 })

    const rec = await Attendance.findOneAndUpdate(
      { event: eventId, member: memberId },
      { status: status || 'present', markedBy: payload.id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    return new Response(JSON.stringify(rec), { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}

export async function GET(req) {
  try {
    await dbConnect()
    const url = new URL(req.url)
    const eventId = url.searchParams.get('eventId')
    const memberId = url.searchParams.get('memberId')

    if (eventId) {
      const data = await Attendance.find({ event: eventId }).populate('member', 'name email domain').lean()
      return new Response(JSON.stringify(data), { status: 200 })
    }
    if (memberId) {
      const data = await Attendance.find({ member: memberId }).populate('event', 'title date time').lean()
      return new Response(JSON.stringify(data), { status: 200 })
    }

    // fallback
    const all = await Attendance.find({}).populate('member event').lean()
    return new Response(JSON.stringify(all), { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
