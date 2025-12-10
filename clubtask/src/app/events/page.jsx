'use client'

import MainLayout from '@/components/MainLayout'
import { useEffect, useState } from 'react'
import { DOMAINS } from '@/data/domains' // adjust path if needed

const uid = (p='') => p + Date.now().toString(36).slice(-6)

function Overlay({ open, onClose, title, width='max-w-lg', children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className={`relative bg-gray-900 border border-green-700/40 rounded-xl w-full ${width} p-5 z-50`}>
        <button onClick={onClose} className="absolute top-3 right-3 text-sm bg-gray-800 px-2 py-1 rounded">X</button>
        {title && <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>}
        {children}
      </div>
    </div>
  )
}

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [openCreate, setOpenCreate] = useState(false)
  const [openAttendFor, setOpenAttendFor] = useState(null)
  const [openDescFor, setOpenDescFor] = useState(null)
  const [attendance, setAttendance] = useState({}) // { memberId: 'present'|'absent' }

  // form state
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [venue, setVenue] = useState('')
  const [desc, setDesc] = useState('')
  const [color, setColor] = useState('#60a5fa')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('events')
      if (raw) setEvents(JSON.parse(raw))
      else {
        const defaults = [
          { id: 'e1', date: 'SEP 15', title: 'Workshop', time: '15:00', location: 'DT 902', color: 'green', description: 'Hands-on design workshop.' },
          { id: 'e2', date: 'SEP 23', title: 'Git for Geeks', time: '15:00', location: 'DT 112', color: 'orange', description: 'Intro to Git and GitHub.' }
        ]
        setEvents(defaults); localStorage.setItem('events', JSON.stringify(defaults))
      }
    } catch (e) {
      console.warn(e); setEvents([])
    }
  }, [])

  const persist = (arr) => { localStorage.setItem('events', JSON.stringify(arr)); setEvents(arr) }

  const appendBoardTask = (evt) => {
    try {
      const raw = localStorage.getItem('boardTasks'); const tasks = raw ? JSON.parse(raw) : []
      tasks.unshift({
        id: 'ev-'+uid(''),
        title: evt.title,
        timeline: evt.date || evt.time || '—',
        color: (evt.color||'#60a5fa').replace('#',''),
        columnId: 'col1',
        assignee: null,
        createdAt: new Date().toISOString(),
        meta: { type:'event', venue: evt.location || evt.venue, description: evt.description || '' }
      })
      localStorage.setItem('boardTasks', JSON.stringify(tasks))
    } catch (e) { console.warn(e) }
  }

  const saveEvent = () => {
    if (!name.trim()) return alert('Enter event name')
    const e = { id: uid('evt-'), date: date ? new Date(date).toLocaleDateString() : '', title: name.trim(), time, location: venue, color, description: desc }
    const updated = [e, ...events]; persist(updated); appendBoardTask(e)
    setName(''); setDate(''); setTime(''); setVenue(''); setDesc(''); setColor('#60a5fa'); setOpenCreate(false)
  }

  const deleteEvent = (id) => {
    if (!confirm('Delete this event?')) return
    persist(events.filter(e => e.id !== id))
  }

  // Attendance helpers
  const allMembers = DOMAINS.flatMap(d => d.members.map(m => ({ ...m, domain: d.name })))
  const openAttendance = (eventId) => {
    // default all present; if stored, load saved
    const map = {}; allMembers.forEach(m => map[m.id] = 'present')
    try {
      const raw = localStorage.getItem(`attendance-${eventId}`)
      if (raw) Object.assign(map, JSON.parse(raw))
    } catch (e) { console.warn(e) }
    setAttendance(map); setOpenAttendFor(eventId)
  }
  const setStatus = (memberId, status) => setAttendance(prev => ({ ...prev, [memberId]: status }))
  const saveAttendance = (eventId) => {
    try { localStorage.setItem(`attendance-${eventId}`, JSON.stringify(attendance)); alert('Attendance saved'); setOpenAttendFor(null) }
    catch (e) { console.warn(e) }
  }

  const colorClass = c => c?.toLowerCase()?.includes('green') ? 'border-green-500 bg-green-950/20' : c?.toLowerCase()?.includes('orange') ? 'border-orange-500 bg-orange-950/20' : c?.toLowerCase()?.includes('blue') ? 'border-blue-500 bg-blue-950/20' : 'border-gray-500 bg-gray-800/20'

  return (
    <MainLayout hudType="events">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">EVENT_TIMELINE</h2>
          <button onClick={() => setOpenCreate(true)} className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-6 rounded">&gt;[ UPCOMING_SCHEDULE ]</button>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {events.map(ev => (
            <div key={ev.id} className={`${colorClass(ev.color)} border-2 rounded-lg p-4 transition hover:scale-105 relative`}>

              {/* Delete top-right */}
              <button
                onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id) }}
                className="absolute top-1 right-2 text-xs text-red-400 hover:text-red-300"
                aria-label="Delete event"
              > x
              </button>

              {/* Card body clickable for description */}
              <div onClick={() => setOpenDescFor(ev)} className="cursor-pointer">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">{ev.date}</span>
                  <span className="text-xs text-gray-300">{ev.time}</span>
                </div>
                <h3 className="text-white font-bold mb-1">{ev.title}</h3>
                <p className="text-gray-400 text-sm mb-3">Location: {ev.location}</p>
              </div>

              {/* Left: Mark Attendance */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); openAttendance(ev.id) }}
                  className="px-2 py-1 border-2 bg-green-700/50 text-white rounded text-sm"
                > Mark_Attendance
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Event Overlay (opened by UPCOMING_SCHEDULE) */}
      <Overlay open={openCreate} onClose={() => setOpenCreate(false)} title="Create Event">
        <div className="space-y-3">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Event name" className="w-full px-3 py-2 rounded bg-gray-800 border border-green-700 text-white" />
          <div className="flex gap-2">
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="flex-1 px-3 py-2 rounded bg-gray-800 border border-green-700 text-white" />
            <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="w-36 px-3 py-2 rounded bg-gray-800 border border-green-700 text-white" />
          </div>
          <input value={venue} onChange={e=>setVenue(e.target.value)} placeholder="Venue" className="w-full px-3 py-2 rounded bg-gray-800 border border-green-700 text-white" />
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" rows={3} className="w-full px-3 py-2 rounded bg-gray-800 border border-green-700 text-white" />
          <div className="flex items-center gap-3">
            <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-12 h-10 p-0 rounded" />
            <div className="text-xs text-gray-300">Pick color</div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveEvent} className="flex-1 px-4 py-2 bg-green-600 text-black rounded font-bold">Save Event (add to Board)</button>
            <button onClick={()=>setOpenCreate(false)} className="px-4 py-2 bg-gray-800 border border-green-700 text-green-300 rounded">Cancel</button>
          </div>
        </div>
      </Overlay>

      {/* Attendance Overlay */}
      <Overlay open={!!openAttendFor} onClose={()=>setOpenAttendFor(null)} title={openAttendFor ? `Mark Attendance — ${events.find(e=>e.id===openAttendFor)?.title||''}` : ''} width="max-w-2xl">
        <div className="mb-3 text-sm text-gray-300">Default = Present. Toggle to Absent as needed.</div>
        <div className="max-h-[50vh] overflow-auto space-y-4">
          {DOMAINS.map(domain => (
            <div key={domain.id}>
              <div className="text-sm text-green-300 font-semibold mb-2">{domain.name}</div>
              <div className="flex flex-wrap gap-3">
                {domain.members.map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-800/40 rounded border">
                    <div className="min-w-[140px]">
                      <div className="text-white">{m.name}</div>
                      <div className="text-xs text-gray-400">{m.id}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>setStatus(m.id,'present')} className={`px-3 py-1 rounded text-sm ${attendance[m.id]==='present'?'bg-green-600 text-black':'bg-gray-800 text-green-300'}`}>Present</button>
                      <button onClick={()=>setStatus(m.id,'absent')} className={`px-3 py-1 rounded text-sm ${attendance[m.id]==='absent'?'bg-red-600 text-black':'bg-gray-800 text-red-300'}`}>Absent</button>
                    </div>
                    <div className="ml-4 text-xs text-gray-400">({domain.name})</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={()=>saveAttendance(openAttendFor)} className="px-4 py-2 bg-green-600 text-black rounded">Save Attendance</button>
          <button onClick={()=>setOpenAttendFor(null)} className="px-4 py-2 bg-gray-800 border border-green-700 text-green-300 rounded">Cancel</button>
          <button onClick={()=>{ const reset={}; allMembers.forEach(m=>reset[m.id]='present'); setAttendance(reset) }} className="ml-auto px-3 py-2 bg-gray-700 rounded text-sm text-gray-200">Reset All</button>
        </div>
      </Overlay>

      {/* Description Overlay */}
      <Overlay open={!!openDescFor} onClose={()=>setOpenDescFor(null)} title="Event Details" width="max-w-md">
        {openDescFor && (
          <div>
            <div className="text-white font-semibold mb-2">{openDescFor.title}</div>
            <div className="text-sm text-gray-300 mb-2">{openDescFor.date} • {openDescFor.time}</div>
            <div className="text-sm text-gray-400 mb-3">Venue: {openDescFor.location}</div>
            <div className="text-sm text-gray-300">{openDescFor.description || 'No description provided.'}</div>
          </div>
        )}
      </Overlay>
    </MainLayout>
  )
}
