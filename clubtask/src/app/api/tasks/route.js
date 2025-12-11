import dbConnect from '@/lib/mongodb'
import Task from '@/models/Task'
import { getUserFromReq } from '@/lib/getUserFromReq'
import mongoose from 'mongoose'

export async function GET(req) {
  try {
    await dbConnect()
    const url = new URL(req.url)
    const assignee = url.searchParams.get('assignee') // optional
    const query = {}
    if (assignee && mongoose.Types.ObjectId.isValid(assignee)) query.assignee = assignee
    const tasks = await Task.find(query).sort({ createdAt: -1 }).lean()
    return new Response(JSON.stringify(tasks), { status: 200 })
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

    const data = await req.json()
    const task = new Task(data)
    await task.save()
    return new Response(JSON.stringify(task), { status: 201 })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}

export async function PUT(req) {
  try {
    await dbConnect()
    const { payload, error } = getUserFromReq(req)
    if (error) return new Response(JSON.stringify({ error }), { status: 401 })

    const data = await req.json()
    const { id, updates } = data
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 })

    const task = await Task.findByIdAndUpdate(id, updates, { new: true })
    return new Response(JSON.stringify(task), { status: 200 })
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

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 })

    await Task.findByIdAndDelete(id)
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
