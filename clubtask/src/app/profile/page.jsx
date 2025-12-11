'use client'

import MainLayout from '@/components/MainLayout'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DOMAINS } from '@/data/domains' // adjust path if needed

export default function ProfilePage() {
  const router = useRouter()

  const [currentMemberId, setCurrentMemberId] = useState(null)
  const [currentMemberName, setCurrentMemberName] = useState('')
  const [email, setEmail] = useState('')
  const [position, setPosition] = useState('Member')
  const [domainName, setDomainName] = useState('')
  const [bio, setBio] = useState('')
  const [memberSince, setMemberSince] = useState((new Date()).getFullYear().toString())

  const [boardTasks, setBoardTasks] = useState([])      // in-memory, populate from props/API if needed
  const [eventsList, setEventsList] = useState([])      // in-memory
  const [attendanceState, setAttendanceState] = useState({}) // in-memory

  // bio edit UI state (in-memory only)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [draftBio, setDraftBio] = useState('')

  // flatten members for lookups
  const ALL_MEMBERS = DOMAINS.flatMap(d => d.members.map(m => ({ id: m.id, name: m.name, domain: d.name })))

  // read query params client-side (avoids useSearchParams / suspense issue)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const memberFromQuery = params.get('member') || null

    if (memberFromQuery) {
      setCurrentMemberId(memberFromQuery)
      const found = ALL_MEMBERS.find(m => m.id === memberFromQuery)
      if (found) {
        setCurrentMemberName(found.name)
        setDomainName(found.domain)
      } else {
        setCurrentMemberName('')
        setDomainName('')
      }
    } else {
      // no member in query — keep placeholders (you can set defaults here)
      setCurrentMemberId(null)
      setCurrentMemberName('')
      setDomainName('')
    }

    // if you later want to populate boardTasks/events from an API or parent prop, do it here
    // leaving boardTasks/events empty (in-memory) avoids any SSR/localStorage usage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // completed tasks (in-memory)
  const completedTasks = useMemo(() => {
    if (!currentMemberId) return []
    return boardTasks.filter(t => t.assignee === currentMemberId && (t.columnId === 'done' || t.columnId === 'DEPLOYED'))
  }, [boardTasks, currentMemberId])

  const tasksCompletedCount = completedTasks.length

  // events attended count (in-memory)
  const eventsAttended = useMemo(() => {
    if (!currentMemberId) return 0
    let count = 0
    for (const ev of eventsList) {
      const map = attendanceState[ev.id] || {}
      const status = map[currentMemberId] || 'present'
      if (status === 'present') count++
    }
    return count
  }, [eventsList, attendanceState, currentMemberId])

  // ensure fallback names/domains if id matched later
  useEffect(() => {
    if (!currentMemberName && currentMemberId) {
      const mm = ALL_MEMBERS.find(m => m.id === currentMemberId)
      if (mm) {
        setCurrentMemberName(mm.name)
        setDomainName(mm.domain)
      }
    }
  }, [currentMemberId, currentMemberName, ALL_MEMBERS])

  const handleLogout = () => {
    router.push('/login')
  }

  const initials = (name) => {
    if (!name) return 'US'
    return name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()
  }

  // Bio editing handlers (memory only)
  const startEditBio = () => {
    setDraftBio(bio || '')
    setIsEditingBio(true)
  }
  const cancelEditBio = () => {
    setDraftBio('')
    setIsEditingBio(false)
  }
  const saveBio = () => {
    const trimmed = (draftBio || '').trim()
    setBio(trimmed)
    setIsEditingBio(false)
    // NOTE: no persistence here (you asked to remove localStorage). If you want server or parent persistence,
    // expose a callback prop or call your API here.
  }

  return (
    <MainLayout hudType="profile">
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">MY PROFILE</h2>
          <div className="mt-4 md:mt-0 md:w-56">
            <button onClick={handleLogout} className="w-full bg-red-900/50 hover:bg-red-900/70 border border-red-500 text-red-400 font-bold py-2 px-4 rounded">[ LOG OUT ]</button>
          </div>
        </div>

        {/* Upper: expanded profile card with completed tasks replacing the three boxes */}
        <div className="bg-gray-900/30 border border-green-900/50 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-green-800 flex items-center justify-center text-white text-3xl font-bold">
              {initials(currentMemberName || 'US')}
            </div>

            <div className="flex-1">
              <div className="text-white text-xl font-semibold">{currentMemberName || 'Unknown User'}</div>
              <div className="text-sm text-gray-400 mt-1">{email || ''}</div>
              <div className="text-xs text-gray-400 mt-2">Domain: <span className="text-white ml-1">{domainName || '—'}</span></div>
              <div className="text-xs text-gray-400 mt-1">Position: <span className="text-white ml-1">{position || 'Member'}</span></div>
              <div className="text-xs text-gray-400 mt-1">Member since: <span className="text-white ml-1">{memberSince}</span></div>
            </div>
          </div>

          {/* bio (editable) */}
          <div className="mt-6 text-sm text-gray-300">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400">Bio:</div>
              {!isEditingBio ? (
                <button onClick={startEditBio} className="text-xs bg-gray-800 px-2 py-1 rounded text-green-300">Edit Bio</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={saveBio} className="text-xs bg-green-600 px-2 py-1 rounded text-black">Save</button>
                  <button onClick={cancelEditBio} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">Cancel</button>
                </div>
              )}
            </div>

            {!isEditingBio ? (
              <div className="mt-2 text-gray-200 rounded-lg bg-gray-800/20 p-3">{bio || 'No bio provided.'}</div>
            ) : (
              <textarea
                value={draftBio}
                onChange={(e) => setDraftBio(e.target.value)}
                rows={5}
                className="w-full mt-2 bg-black/50 border border-green-700 text-white rounded p-3 focus:outline-none focus:border-green-400 resize-none"
                placeholder="Write something about yourself..."
                aria-label="Edit bio"
              />
            )}
          </div>
        </div>

        {/* Bottom: Activity Summary (kept as it was) */}
        <div className="bg-gray-900/30 border border-green-900/50 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-3">Activity Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded bg-gray-800/30 text-center">
              <div className="text-xs text-gray-400">Tasks completed</div>
              <div className="text-white font-bold text-2xl">{tasksCompletedCount}</div>
            </div>
            <div className="p-3 rounded bg-gray-800/30 text-center">
              <div className="text-xs text-gray-400">Events present</div>
              <div className="text-white font-bold text-2xl">{eventsAttended}</div>
            </div>
            <div className="p-3 rounded bg-gray-800/30 text-center">
              <div className="text-xs text-gray-400">Member since</div>
              <div className="text-white font-bold text-2xl">{memberSince}</div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
