'use client'

import { authFetch } from '@/lib/ClientFetch'
import { useEffect, useMemo, useState } from 'react'
import MainLayout from '@/components/MainLayout'
import { DOMAINS } from '@/data/domains'

// CSV helper
function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(cell => {
    if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
      return `"${cell.replace(/"/g, '""')}"`
    }
    return cell
  }).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function normalizeAttendanceFromArray(arr) {
  if (!Array.isArray(arr)) return {}
  const map = {}
  arr.forEach(item => {
    if (!item) return

    if (item.member && typeof item.member === 'object') {
      const mid = String(item.member._id || item.member.id || item.member)
      const status = item.status || item.attendance || (item.present ? 'present' : undefined)
      if (mid && status) map[mid] = status
      return
    }
    const mid = String(item.member || item.memberId || item.member_id || item._id || item.id || '')
    const status = item.status || item.attendance || (item.present ? 'present' : undefined)
    if (mid && status) map[mid] = status
  })
  return map
}

export default function AttendancePage() {
  const [events, setEvents] = useState([])
  const [attendanceState, setAttendanceState] = useState({})
  const [userRole, setUserRole] = useState('member')
  const [currentMemberId, setCurrentMemberId] = useState(null)
  const [currentMemberName, setCurrentMemberName] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [expandedEvent, setExpandedEvent] = useState(null)

  const [membersList, setMembersList] = useState([])

  useEffect(() => {
    setUserRole(localStorage.getItem('userRole') || 'member')
    const savedId = localStorage.getItem('currentMemberId') || localStorage.getItem('userId') || null
    const savedName = localStorage.getItem('currentMemberName') || localStorage.getItem('profileName') || null
    if (savedId) setCurrentMemberId(savedId)
    if (savedName) setCurrentMemberName(savedName)

    ;(async () => {
      // 1) Try to fetch members from server (DB members)
      try {
        const mr = await authFetch('/api/members')
        if (mr.ok && Array.isArray(mr.data)) {
          const list = mr.data.map(m => ({ id: String(m._id || m.id), name: m.name || m.email || 'Unknown', domain: m.domain || '' }))
          setMembersList(list)
        } else {
          setMembersList(DOMAINS.flatMap(d => d.members.map(m => ({ id: m.id, name: m.name, domain: d.name }))))
        }
      } catch (e) {
        setMembersList(DOMAINS.flatMap(d => d.members.map(m => ({ id: m.id, name: m.name, domain: d.name }))))
      }

      // 2) Fetch events
      let rawEvents = []
      try {
        const er = await authFetch('/api/events')
        if (er.ok && Array.isArray(er.data)) rawEvents = er.data
        else {
          const stored = localStorage.getItem('events'); rawEvents = stored ? JSON.parse(stored) : []
        }
      } catch (e) {
        const stored = localStorage.getItem('events'); rawEvents = stored ? JSON.parse(stored) : []
      }

      const normalizedEvents = rawEvents.map(ev => ({
        id: String(ev._id || ev.id || Math.random()),
        title: ev.title || ev.name || '',
        date: ev.date || ev.rawDate || '',
        raw: ev
      }))
      setEvents(normalizedEvents)

      // 3) For each event, fetch attendance and normalize
      const state = {}
      for (const ev of normalizedEvents) {
        try {
          const qId = ev.raw && (ev.raw._id || ev.raw.id) ? (ev.raw._id || ev.raw.id) : ev.id
          const ar = await authFetch(`/api/attendance?eventId=${qId}`)
          if (ar.ok && Array.isArray(ar.data)) {
            state[ev.id] = normalizeAttendanceFromArray(ar.data)
            try { localStorage.setItem(`attendance-${ev.id}`, JSON.stringify(state[ev.id])) } catch {}
            continue
          }
        } catch (err) {
          console.warn('attendance fetch failed for', ev.id, err)
        }
        try {
          const rawA = localStorage.getItem(`attendance-${ev.id}`)
          state[ev.id] = rawA ? JSON.parse(rawA) : {}
        } catch {
          state[ev.id] = {}
        }
      }
      setAttendanceState(state)
    })()
  }, [])

  const myLog = useMemo(() => {
    if (!currentMemberId) return []
    return events.map(e => {
      const map = attendanceState[e.id] || {}
      const status = map[currentMemberId] || map[String(currentMemberId)] || 'not marked'
      return { eventId: e.id, title: e.title, date: e.date, status }
    })
  }, [events, attendanceState, currentMemberId])

  // myOverall
  const myOverall = useMemo(() => {
    if (!currentMemberId) return { total:0, present:0, absent:0, percent:0 }
    const total = myLog.length
    const present = myLog.filter(r => r.status === 'present').length
    const absent = myLog.filter(r => r.status === 'absent').length
    const percent = total ? Math.round((present/total)*100) : 0
    return { total, present, absent, percent }
  }, [myLog])

  // overallAll for lead
  const overallAll = useMemo(() => {
    let totalRecords = 0, totalPresent = 0
    events.forEach(ev => {
      const map = attendanceState[ev.id] || {}
      Object.values(map || {}).forEach(s => { totalRecords++; if (s === 'present') totalPresent++ })
    })
    const percent = totalRecords ? Math.round((totalPresent/totalRecords)*100) : 0
    return { totalEvents: events.length, totalRecords, totalPresent, totalAbsent: totalRecords - totalPresent, percent }
  }, [events, attendanceState])

  const buildMyCSV = () => {
    const rows = [['eventId','eventTitle','eventDate','memberId','memberName','status']]
    myLog.forEach(r => rows.push([r.eventId, r.title||'', r.date||'', currentMemberId, currentMemberName||'', r.status]))
    return rows
  }
  const buildAllCSV = () => {
    const rows = [['eventId','eventTitle','eventDate','memberId','memberName','status']]
    events.forEach(ev => {
      const map = attendanceState[ev.id] || {}
      membersList.forEach(m => {
        const status = map[m.id] || map[String(m.id)] || 'not marked'
        rows.push([ev.id, ev.title||'', ev.date||'', m.id, m.name, status])
      })
    })
    return rows
  }
  const buildEventCSV = (eventId) => {
    const e = events.find(x => x.id === eventId)
    const rows = [['eventId','eventTitle','eventDate','memberId','memberName','status']]
    membersList.forEach(m => {
      const map = attendanceState[eventId] || {}
      const status = map[m.id] || map[String(m.id)] || 'not marked'
      rows.push([eventId, e?.title||'', e?.date||'', m.id, m.name, status])
    })
    return rows
  }

  const exportMyCSV = () => { if (!currentMemberId) return alert('Select yourself first'); downloadCSV(`${(currentMemberName||currentMemberId)}_attendance.csv`, buildMyCSV()) }
  const exportAllCSV = () => { downloadCSV('attendance_all_members.csv', buildAllCSV()) }
  const exportEventCSV = (id) => { const e = events.find(x => x.id === id); downloadCSV(`${(e?.title||id).replace(/\s+/g,'_')}_attendance.csv`, buildEventCSV(id)) }

  const chooseMember = (id) => {
    const m = membersList.find(x => x.id === id)
    if (!m) return
    localStorage.setItem('currentMemberId', m.id); localStorage.setItem('currentMemberName', m.name)
    setCurrentMemberId(m.id); setCurrentMemberName(m.name); setPickerOpen(false)
  }

  const badgeClass = (status) => status === 'absent' ? 'bg-red-600 text-white' : (status === 'present' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white')
  const eventBadge = () => 'bg-green-600 text-black font-bold px-3 py-1 rounded'

  return (
    <MainLayout hudType="attendance">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-start gap-6">
          {/* main area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">{userRole === 'lead' ? 'ATTENDANCE — ADMIN' : 'MY ATTENDANCE'}</h2>
              <div className="flex items-center gap-3">
                {userRole === 'lead' ? (
                  <>
                    <button onClick={exportAllCSV} className="px-3 py-2 bg-green-600 text-black rounded">Generate CSV (All)</button>
                    <button onClick={() => setPickerOpen(prev => !prev)} className="px-3 py-2 bg-gray-800 border border-green-700 text-green-300 rounded">View Member</button>
                  </>
                ) : (
                  <>
                    {!currentMemberId ? <button onClick={() => setPickerOpen(true)} className="px-3 py-2 bg-green-600 text-black rounded">Select Me</button> : <button onClick={exportMyCSV} className="px-3 py-2 bg-green-600 text-black rounded">Export CSV (My Log)</button>}
                  </>
                )}
              </div>
            </div>

            {pickerOpen && (
              <div className="mb-6 p-3 rounded-lg border border-green-700/30 bg-gray-900/30">
                <div className="text-sm text-gray-300 mb-2">Choose a member to view:</div>
                <select className="w-full px-3 py-2 bg-gray-800 border border-green-700 text-white rounded" onChange={e => chooseMember(e.target.value)} defaultValue="">
                  <option value="">— select —</option>
                  {membersList.map(m => <option key={m.id} value={m.id}>{m.name} ({m.domain})</option>)}
                </select>
              </div>
            )}

            {/* top summary */}
            <div className="mb-6 p-4 rounded-lg border border-green-700 bg-gray-900/40 flex items-center justify-between">
              <div>
                <div className="text-sm text-green-300">{userRole === 'lead' ? 'Overall Club Attendance' : 'Your Attendance'}</div>
                <div className="text-2xl font-bold text-white">{userRole === 'lead' ? overallAll.percent + '%' : myOverall.percent + '%'}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {userRole === 'lead' ? (
                    <>Events: <span className="font-medium text-white">{overallAll.totalEvents}</span> • Records: <span className="font-medium text-white ml-1">{overallAll.totalRecords}</span></>
                  ) : (
                    <>Events: <span className="font-medium text-white">{myOverall.total}</span> • Present: <span className="font-medium text-white ml-1">{myOverall.present}</span> • Absent: <span className="font-medium text-white ml-1">{myOverall.absent}</span></>
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className={`px-4 py-2 rounded-lg ${eventBadge()}`}>Event</div>
                <div className="text-xs text-gray-400 mt-2">Present = blue, Absent = red</div>
              </div>
            </div>

            {/* attendance logs */}
            <div className="space-y-4">
              {events.length === 0 ? <div className="text-gray-400">No events found.</div> : events.map(ev => {
                const map = attendanceState[ev.id] || {}
                // present/absent counts
                const presentCount = Object.keys(map).length ? Object.values(map).filter(s => s === 'present').length : 0
                const absentCount = Object.keys(map).length ? Object.values(map).filter(s => s === 'absent').length : 0
                const attendanceMarked = Object.keys(map).length > 0

                return (
                  <div key={ev.id} className="rounded-lg border border-green-700/20 bg-gray-900/30 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-green-300 font-semibold">{ev.title}</div>
                        <div className="text-xs text-gray-400">{ev.date}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        {userRole === 'lead' ? (
                          <>
                            <div className="text-sm text-gray-300">Present: <span className="font-medium text-white ml-1">{presentCount}</span></div>
                            <div className="text-sm text-gray-300">Absent: <span className="font-medium text-white ml-1">{absentCount}</span></div>
                            <button onClick={() => { setExpandedEvent(prev => prev === ev.id ? null : ev.id) }} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">{expandedEvent === ev.id ? 'Hide' : 'View'}</button>
                            <button onClick={() => exportEventCSV(ev.id)} className="px-3 py-1 rounded bg-green-600 text-black text-sm">Export CSV</button>
                          </>
                        ) : (
                          <>
                            <div className={`px-3 py-1 rounded ${badgeClass((map && (map[currentMemberId] || map[String(currentMemberId)])) ? (map[currentMemberId] || map[String(currentMemberId)]) : 'not marked')}`}>{(map && (map[currentMemberId] || map[String(currentMemberId)])) ? (map[currentMemberId] || map[String(currentMemberId)]) : 'not marked'}</div>
                          </>
                        )}
                      </div>
                    </div>

                    {expandedEvent === ev.id && (
                      <div className="mt-3 border-t border-green-700/10 pt-3">
                        { !attendanceMarked ? (
                          <div className="text-sm text-gray-400">Attendance not marked yet for this event.</div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {membersList.map(m => {
                              const status = (attendanceState[ev.id] && (attendanceState[ev.id][m.id] || attendanceState[ev.id][String(m.id)])) ? (attendanceState[ev.id][m.id] || attendanceState[ev.id][String(m.id)]) : 'not marked'
                              return (
                                <div key={m.id} className="flex items-center justify-between p-3 rounded bg-gray-800/40">
                                  <div>
                                    <div className="text-white font-medium">{m.name}</div>
                                    <div className="text-xs text-gray-400">{m.domain}</div>
                                  </div>
                                  <div className={`px-3 py-1 rounded ${badgeClass(status)}`}>{status}</div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          {userRole === 'lead' && (
            <aside className="w-80 self-start">
              <div className="p-4 rounded-lg border border-green-700 bg-gray-900/40">
                <div className="text-sm text-green-300 mb-2">Lead — Personal Attendance</div>

                {!currentMemberId ? (
                  <div className="mb-3">
                    <div className="text-xs text-gray-300 mb-2">Select yourself (saved locally):</div>
                    <select onChange={e => { const v = e.target.value; const m = membersList.find(x => x.id === v); if (m) { localStorage.setItem('currentMemberId', m.id); localStorage.setItem('currentMemberName', m.name); setCurrentMemberId(m.id); setCurrentMemberName(m.name) } }} className="w-full px-2 py-2 bg-gray-800 border border-green-700 text-white rounded">
                      <option value="">— select —</option>
                      {membersList.map(m => <option key={m.id} value={m.id}>{m.name} ({m.domain})</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="mb-3 text-sm text-gray-300">Showing: <span className="text-white font-semibold ml-2">{currentMemberName}</span></div>
                )}

                <div className="text-sm text-gray-400 mb-3">Overall: <span className="font-bold text-white ml-2">{myOverall.percent}%</span></div>

                <div className="space-y-2 max-h-[60vh] overflow-auto">
                  {myLog.length === 0 ? <div className="text-gray-400">No records</div> : myLog.map(r => (
                    <div key={r.eventId} className="flex items-center justify-between p-2 rounded bg-gray-800/30">
                      <div>
                        <div className="text-white text-sm">{r.title}</div>
                        <div className="text-xs text-gray-400">{r.date}</div>
                      </div>
                      <div className={`px-3 py-1 rounded text-xs ${badgeClass(r.status)}`}>{r.status}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => downloadCSV(`${(currentMemberName || currentMemberId)}_attendance.csv`, buildMyCSV())} className="px-3 py-2 bg-green-600 text-black rounded">Export My CSV</button>
                  <button onClick={() => downloadCSV('attendance_all_members.csv', buildAllCSV())} className="px-3 py-2 bg-gray-800 border border-green-700 text-green-300 rounded">Export All</button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

// helpers
function badgeClass(status) {
  if (status === 'absent') return 'bg-red-600 text-white'
  if (status === 'present') return 'bg-blue-600 text-white'
  return 'bg-gray-700 text-white'
}