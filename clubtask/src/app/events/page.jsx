'use client'

import MainLayout from '@/components/MainLayout'
import { useEffect, useState } from 'react'
import { DOMAINS } from '@/data/domains' // adjust if needed
import { authFetch } from '@/lib/ClientFetch' // <- new helper

const uid = (p = '') => p + Date.now().toString(36).slice(-6)

function Overlay({ open, onClose, title, width = 'w-full sm:max-w-lg', children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-start sm:pt-24">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`${width} relative bg-gray-900 border border-green-700/40 rounded-t-xl sm:rounded-xl p-4 sm:p-5 z-50 mx-4`}>
        <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 text-sm bg-gray-800 px-2 py-1 rounded">X</button>
        {title && <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>}
        {children}
      </div>
    </div>
  )
}

export default function EventsPage() {
  const [role, setRole] = useState('member')
  const [events, setEvents] = useState([])
  const [attendanceState, setAttendanceState] = useState({})

  // UI
  const [openCreate, setOpenCreate] = useState(false)
  const [openAttendFor, setOpenAttendFor] = useState(null)
  const [openDescFor, setOpenDescFor] = useState(null)
  const [editingAttendance, setEditingAttendance] = useState({})

  // create form
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [venue, setVenue] = useState('')
  const [desc, setDesc] = useState('')

  // members list
  const ALL_MEMBERS = DOMAINS.flatMap(d => d.members.map(m => ({ id: m.id, name: m.name, domain: d.name })))

  useEffect(() => {
    const r = localStorage.getItem('userRole') || 'member'
    setRole(r)

    // Try fetch events from backend; if fails, fallback to localStorage defaults.
    ;(async () => {
      try {
        const res = await authFetch('/api/events')
        if (res.ok && Array.isArray(res.data)) {
          setEvents(res.data)
        } else {
          // fallback to localStorage/defaults
          const raw = localStorage.getItem('events')
          if (raw) setEvents(JSON.parse(raw))
          else {
            const defaults = [
              { id: 'e1', date: 'SEP 15', title: 'Workshop', time: '15:00', location: 'DT 902', description: 'Hands-on design workshop.' },
              { id: 'e2', date: 'SEP 23', title: 'Git for Geeks', time: '15:00', location: 'DT 112', description: 'Intro to Git and GitHub.' }
            ]
            setEvents(defaults); localStorage.setItem('events', JSON.stringify(defaults))
          }
        }

        // load attendance per event from backend if available
        const state = {}
        // If backend provided events we loaded them; attempt to fetch attendance per event
        const evs = res?.data || JSON.parse(localStorage.getItem('events') || '[]')
        for (const e of evs) {
          try {
            const attRes = await authFetch(`/api/attendance?eventId=${encodeURIComponent(e.id)}`)
            if (attRes.ok) state[e.id] = attRes.data || null
            else {
              const rawA = localStorage.getItem(`attendance-${e.id}`)
              state[e.id] = rawA ? JSON.parse(rawA) : null
            }
          } catch { state[e.id] = null }
        }
        setAttendanceState(state)
      } catch (err) {
        console.warn('events load failed', err)
        // fallback
        const raw = localStorage.getItem('events')
        if (raw) setEvents(JSON.parse(raw))
        else {
          const defaults = [
            { id: 'e1', date: 'SEP 15', title: 'Workshop', time: '15:00', location: 'DT 902', description: 'Hands-on design workshop.' },
            { id: 'e2', date: 'SEP 23', title: 'Git for Geeks', time: '15:00', location: 'DT 112', description: 'Intro to Git and GitHub.' }
          ]
          setEvents(defaults); localStorage.setItem('events', JSON.stringify(defaults))
        }
      }
    })()
  }, [])

  const persistEvents = (arr) => { localStorage.setItem('events', JSON.stringify(arr)); setEvents(arr) }

  // append board task helper (try backend then fallback)
  const appendBoardTask = async (evt) => {
    try {
      const payload = {
        title: evt.title,
        timeline: evt.date || evt.time || '—',
        color: 'green',
        columnId: 'backlog',
        meta: { type: 'event', venue: evt.location, description: evt.description || '' }
      }
      const res = await authFetch('/api/tasks', { method: 'POST', body: JSON.stringify(payload) })
      if (res.ok && res.data) return res.data
      // fallback to localStorage
      const raw = localStorage.getItem('boardTasks'); const tasks = raw ? JSON.parse(raw) : []
      const t = { id: 'ev-' + uid(''), ...payload, createdAt: new Date().toISOString() }
      tasks.unshift(t); localStorage.setItem('boardTasks', JSON.stringify(tasks)); return t
    } catch (e) {
      const raw = localStorage.getItem('boardTasks'); const tasks = raw ? JSON.parse(raw) : []
      const t = { id: 'ev-' + uid(''), title: evt.title, timeline: evt.date || evt.time || '—', color: 'green', columnId: 'backlog', createdAt: new Date().toISOString(), meta: { type: 'event', venue: evt.location } }
      tasks.unshift(t); localStorage.setItem('boardTasks', JSON.stringify(tasks)); return t
    }
  }

  // lead-only create (NO color input)
  const saveEvent = async () => {
    if (role !== 'lead') return alert('Only lead can create events')
    if (!name.trim()) return alert('Enter event name')
    const e = { id: uid('evt-'), date: date ? new Date(date).toLocaleDateString() : '', title: name.trim(), time, location: venue, description: desc }
    // try backend create
    try {
      const res = await authFetch('/api/events', { method: 'POST', body: JSON.stringify({ title: e.title, date: e.date, time: e.time, location: e.location, description: e.description }) })
      if (res.ok && res.data) {
        // server returned created event
        const serverEvent = res.data
        setEvents(prev => [serverEvent, ...prev])
        await appendBoardTask(serverEvent)
      } else {
        // fallback local
        const updated = [e, ...events]; persistEvents(updated); appendBoardTask(e)
      }
    } catch (err) {
      const updated = [e, ...events]; persistEvents(updated); appendBoardTask(e)
    }

    setAttendanceState(prev => ({ ...prev, [e.id]: null }))
    setName(''); setDate(''); setTime(''); setVenue(''); setDesc(''); setOpenCreate(false)
  }

  const deleteEvent = async (id) => {
    if (role !== 'lead') return
    if (!confirm('Delete this event?')) return
    // try backend delete
    try {
      const res = await authFetch(`/api/events/${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (res.ok) {
        setEvents(prev => prev.filter(x => x.id !== id))
        const copy = { ...attendanceState }; delete copy[id]; setAttendanceState(copy); localStorage.removeItem(`attendance-${id}`)
        return
      }
    } catch (e) { /* ignore and fallback */ }
    // fallback
    const filtered = events.filter(e => e.id !== id)
    persistEvents(filtered)
    const copy = { ...attendanceState }; delete copy[id]; setAttendanceState(copy); localStorage.removeItem(`attendance-${id}`)
  }

  const openAttendanceEditor = async (eventId) => {
    if (role !== 'lead') return
    // try load from backend first
    try {
      const res = await authFetch(`/api/attendance?eventId=${encodeURIComponent(eventId)}`)
      if (res.ok) {
        const map = res.data || {}
        // set default present for those not specified
        ALL_MEMBERS.forEach(m => { if (!map[m.id]) map[m.id] = 'present' })
        setEditingAttendance(map)
        setOpenAttendFor(eventId)
        return
      }
    } catch (e) { /* fallback */ }

    // fallback to localStorage
    const stored = attendanceState[eventId] || {}
    const map = {}
    ALL_MEMBERS.forEach(m => { map[m.id] = (stored && stored[m.id]) ? stored[m.id] : 'present' })
    setEditingAttendance(map)
    setOpenAttendFor(eventId)
  }

  const setEditingStatus = (memberId, status) => setEditingAttendance(prev => ({ ...prev, [memberId]: status }))

  const saveAttendance = async (eventId) => {
    if (role !== 'lead') return
    try {
      // try backend save
      const res = await authFetch('/api/attendance', { method: 'POST', body: JSON.stringify({ eventId, attendance: editingAttendance }) })
      if (res.ok) {
        // update from server or set local copy
        setAttendanceState(prev => ({ ...prev, [eventId]: editingAttendance }))
        setOpenAttendFor(null)
        return
      }
    } catch (e) { /* fallback to localStorage */ }

    try {
      localStorage.setItem(`attendance-${eventId}`, JSON.stringify(editingAttendance))
      setAttendanceState(prev => ({ ...prev, [eventId]: editingAttendance }))
      setOpenAttendFor(null)
    } catch (e) { console.warn(e) }
  }

  // UI helpers: all event cards green (fixed)
  const cardGreenClass = 'border-green-500 bg-green-950/20'
  const badgeClass = (status) => status === 'absent' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'

  return (
    <MainLayout hudType="events">
      {/* =======  the rest of your original JSX below exactly as you had it ======= */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">EVENT_TIMELINE</h2>

          <div className="flex items-center gap-3">
            {role === 'lead' ? (
              <button onClick={() => setOpenCreate(true)} className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded">+ Upcoming_Schedule</button>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-300 rounded">Upcoming Schedule</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {events.map(ev => (
            <div key={ev.id} className={`${cardGreenClass} rounded-lg p-3 sm:p-4 transition hover:scale-105 relative break-words border-2`}>
              {role === 'lead' && (
                <button onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id) }} className="absolute top-0 right-2 text-xs sm:text-sm text-red-400 hover:text-red-300">x</button>
              )}

              <div onClick={() => setOpenDescFor(ev)} className="cursor-pointer">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400 text-xs sm:text-sm">{ev.date}</span>
                  <span className="text-xs text-gray-300 absolute right-2 top-4">{ev.time}</span>
                </div>
                <h3 className="text-white font-bold mb-1 text-sm sm:text-base">{ev.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-3 break-words">Location: {ev.location}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                {role === 'lead' && (
                  <button onClick={(e) => { e.stopPropagation(); openAttendanceEditor(ev.id) }} className="px-2 py-2 sm:py-1 bg-green-600/50 text-white border-2 rounded text-xs sm:text-sm">Mark Attendance</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </MainLayout>
  )
}
