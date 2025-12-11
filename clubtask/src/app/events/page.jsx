'use client'

import { useEffect, useMemo, useState } from 'react'
import MainLayout from '@/components/MainLayout'
import { DOMAINS } from '@/data/domains' // adjust if your path differs

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

    try {
      const raw = localStorage.getItem('events')
      if (raw) setEvents(JSON.parse(raw))
      else {
        const defaults = [
          { id: 'e1', date: 'SEP 15', title: 'Workshop', time: '15:00', location: 'DT 902', description: 'Hands-on design workshop.' },
          { id: 'e2', date: 'SEP 23', title: 'Git for Geeks', time: '15:00', location: 'DT 112', description: 'Intro to Git and GitHub.' }
        ]
        setEvents(defaults); localStorage.setItem('events', JSON.stringify(defaults))
      }

      // load attendance per event
      const state = {}
      const rawE = localStorage.getItem('events')
      const ev = rawE ? JSON.parse(rawE) : []
      ev.forEach(e => {
        try { const rawA = localStorage.getItem(`attendance-${e.id}`); state[e.id] = rawA ? JSON.parse(rawA) : null } catch { state[e.id] = null }
      })
      setAttendanceState(state)
    } catch (e) {
      console.warn('load events failed', e)
      setEvents([]); setAttendanceState({})
    }
  }, [])

  const persistEvents = (arr) => { localStorage.setItem('events', JSON.stringify(arr)); setEvents(arr) }

  // lead-only create (NO color input)
  const saveEvent = () => {
    if (role !== 'lead') return alert('Only lead can create events')
    if (!name.trim()) return alert('Enter event name')
    const e = { id: uid('evt-'), date: date ? new Date(date).toLocaleDateString() : '', title: name.trim(), time, location: venue, description: desc }
    const updated = [e, ...events]; persistEvents(updated); appendBoardTask(e)
    setAttendanceState(prev => ({ ...prev, [e.id]: null }))
    setName(''); setDate(''); setTime(''); setVenue(''); setDesc(''); setOpenCreate(false)
  }

  const deleteEvent = (id) => {
    if (role !== 'lead') return
    if (!confirm('Delete this event?')) return
    const filtered = events.filter(e => e.id !== id)
    persistEvents(filtered)
    const copy = { ...attendanceState }; delete copy[id]; setAttendanceState(copy); localStorage.removeItem(`attendance-${id}`)
  }

  const openAttendanceEditor = (eventId) => {
    if (role !== 'lead') return
    const stored = attendanceState[eventId] || {}
    const map = {}
    ALL_MEMBERS.forEach(m => { map[m.id] = (stored && stored[m.id]) ? stored[m.id] : 'present' })
    setEditingAttendance(map)
    setOpenAttendFor(eventId)
  }

  const setEditingStatus = (memberId, status) => setEditingAttendance(prev => ({ ...prev, [memberId]: status }))

  const saveAttendance = (eventId) => {
    if (role !== 'lead') return
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

      {/* CREATE EVENT */}
      <Overlay open={openCreate} onClose={() => setOpenCreate(false)} title="Create Event">
        <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Event name" className="w-full px-3 py-2 rounded bg-gray-800 border border-green-700 text-white" />
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex-1 px-3 py-2 rounded bg-gray-800 border border-green-700 text-white" />
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full sm:w-36 px-3 py-2 rounded bg-gray-800 border border-green-700 text-white" />
          </div>
          <input value={venue} onChange={e => setVenue(e.target.value)} placeholder="Venue" className="w-full px-3 py-2 rounded bg-gray-800 border border-green-700 text-white" />
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" rows={3} className="w-full px-3 py-2 rounded bg-gray-800 border border-green-700 text-white" />
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={saveEvent} className="flex-1 px-4 py-2 bg-green-600 text-black rounded font-bold">Save Event (add to Board)</button>
            <button onClick={() => setOpenCreate(false)} className="px-4 py-2 bg-gray-800 border border-green-700 text-green-300 rounded">Cancel</button>
          </div>
        </div>
      </Overlay>

      {/* ATTENDANCE EDITOR */}
      <Overlay open={!!openAttendFor} onClose={() => setOpenAttendFor(null)} title={openAttendFor ? `Mark Attendance — ${events.find(e => e.id === openAttendFor)?.title || ''}` : ''} width="w-full sm:max-w-2xl">
        <div className="mb-3 text-sm text-gray-300">Default = Present. Toggle to Absent.</div>
        <div className="max-h-[60vh] overflow-auto space-y-4">
          {DOMAINS.map(domain => (
            <div key={domain.id}>
              <div className="text-sm text-green-300 font-semibold mb-2">{domain.name}</div>
              <div className="flex flex-wrap gap-3">
                {domain.members.map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-800/40 rounded border min-w-[220px]">
                    <div className="min-w-[120px]">
                      <div className="text-white">{m.name}</div>
                      <div className="text-xs text-gray-400">{m.id}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingStatus(m.id, 'present')} className={`px-3 py-1 rounded text-sm ${editingAttendance[m.id] === 'present' ? 'bg-green-600 text-black' : 'bg-gray-800 text-green-300'}`}>Present</button>
                      <button onClick={() => setEditingStatus(m.id, 'absent')} className={`px-3 py-1 rounded text-sm ${editingAttendance[m.id] === 'absent' ? 'bg-red-600 text-black' : 'bg-gray-800 text-red-300'}`}>Absent</button>
                    </div>
                    <div className="ml-2 text-xs text-gray-400">({domain.name})</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button onClick={() => saveAttendance(openAttendFor)} className="px-4 py-2 bg-green-600 text-black rounded">Save Attendance</button>
          <button onClick={() => setOpenAttendFor(null)} className="px-4 py-2 bg-gray-800 border border-green-700 text-green-300 rounded">Cancel</button>
          <button onClick={() => { const reset = {}; ALL_MEMBERS.forEach(m => reset[m.id] = 'present'); setEditingAttendance(reset) }} className="ml-auto px-3 py-2 bg-gray-700 rounded text-sm text-gray-200">Reset All</button>
        </div>
      </Overlay>

      {/* DESCRIPTION */}
      <Overlay open={!!openDescFor} onClose={() => setOpenDescFor(null)} title="Event Details" width="w-full sm:max-w-md">
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
