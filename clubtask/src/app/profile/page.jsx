'use client'

import MainLayout from '@/components/MainLayout'
import { authFetch } from '@/lib/ClientFetch' // make sure this file exists
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

  const [boardTasks, setBoardTasks] = useState([])      // in-memory, populated from API or fallback
  const [eventsList, setEventsList] = useState([])      // in-memory
  const [attendanceState, setAttendanceState] = useState({}) // in-memory

  // bio edit UI state (in-memory only)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [draftBio, setDraftBio] = useState('')

  // flatten members for lookups (fallback)
  const ALL_MEMBERS = DOMAINS.flatMap(d => d.members.map(m => ({ id: m.id, name: m.name, domain: d.name })))

  // ---------- NEW: fetch logged-in user's profile ----------
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // Try to read stored token and user id
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const savedUserId = typeof window !== 'undefined' ? (localStorage.getItem('userId') || localStorage.getItem('currentMemberId')) : null

        // helper to apply profile to state
        const applyProfile = (p) => {
          if (!p || !mounted) return
          // possible shapes: { user: {...} } or user object directly
          const user = p.user || p || {}
          const id = user._id || user.id || user._uid || savedUserId || null
          const name = user.name || user.username || user.displayName || user.email?.split?.('@')?.[0] || ''
          const mail = user.email || ''
          const pos = user.position || user.role || position || 'Member'
          const domain = user.domain || user.dept || domainName || ''
          const since = user.memberSince || user.joinedYear || user.createdAt ? (user.memberSince || (user.createdAt ? (new Date(user.createdAt).getFullYear()) : undefined)) : undefined
          const userBio = user.bio || user.profileBio || bio || ''

          if (id) {
            setCurrentMemberId(String(id))
            try { localStorage.setItem('currentMemberId', String(id)) } catch {}
          }
          if (name) {
            setCurrentMemberName(name)
            try { localStorage.setItem('currentMemberName', name) } catch {}
          }
          if (mail) setEmail(mail)
          if (pos) setPosition(pos)
          if (domain) setDomainName(domain)
          if (userBio) setBio(userBio)
          if (since) setMemberSince(String(since))
        }

        // 1) Preferred: /api/auth/me (works if authFetch attaches token)
        try {
          const meRes = await authFetch('/api/auth/me')
          if (meRes && meRes.ok) {
            // server may return { user: {...} } or the user object directly
            applyProfile(meRes.data || meRes)
            return
          }
        } catch (e) {
          // ignore and fallback
        }

        // 2) Fallback: if we have a saved userId, try /api/users/:id
        if (savedUserId) {
          const byIdPaths = [
            `/api/users/${encodeURIComponent(savedUserId)}`,
            `/api/members/${encodeURIComponent(savedUserId)}`,
            `/api/user/${encodeURIComponent(savedUserId)}`,
            `/api/member/${encodeURIComponent(savedUserId)}`
          ]
          for (const p of byIdPaths) {
            try {
              const r = await authFetch(p)
              if (r && r.ok && (r.data || r.user)) {
                applyProfile(r.data || r.user || r)
                return
              }
            } catch (_) { /* try next */ }
          }
        }

        // 3) Final fallback: try /api/members (list) and pick first / match savedUserId
        try {
          const listRes = await authFetch('/api/members')
          if (listRes && listRes.ok && Array.isArray(listRes.data) && listRes.data.length) {
            // prefer savedUserId if present, else pick first user
            const match = savedUserId ? listRes.data.find(u => String(u._id || u.id) === String(savedUserId)) : listRes.data[0]
            if (match) {
              applyProfile(match)
              return
            }
          }
        } catch (_) { /* ignore */ }

        // 4) If nothing found, try localStorage fallbacks (old app behavior)
        const nameLS = localStorage.getItem('profileName') || localStorage.getItem('currentMemberName')
        const idLS = localStorage.getItem('currentMemberId') || localStorage.getItem('userId')
        const posLS = localStorage.getItem('position') || position
        const domLS = localStorage.getItem('domain') || domainName
        const sinceLS = localStorage.getItem('memberSince') || memberSince
        if (idLS) setCurrentMemberId(idLS)
        if (nameLS) setCurrentMemberName(nameLS)
        if (posLS) setPosition(posLS)
        if (domLS) setDomainName(domLS)
        if (sinceLS) setMemberSince(sinceLS)
      } catch (err) {
        console.warn('profile fetch error', err)
      }
    })()

    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // 1) board tasks: if member specified, fetch assigned tasks; otherwise fetch all tasks
        if (currentMemberId) {
          try {
            const tRes = await authFetch(`/api/tasks?assignee=${encodeURIComponent(currentMemberId)}`)
            if (mounted && tRes.ok && Array.isArray(tRes.data)) {
              setBoardTasks(tRes.data)
            } else {
              const rawTasks = localStorage.getItem('boardTasks')
              if (mounted) setBoardTasks(rawTasks ? JSON.parse(rawTasks) : [])
            }
          } catch (err) {
            console.warn('tasks fetch failed', err)
            const rawTasks = localStorage.getItem('boardTasks')
            if (mounted) setBoardTasks(rawTasks ? JSON.parse(rawTasks) : [])
          }
        } else {
          // no member: try fetch all tasks
          try {
            const allRes = await authFetch('/api/tasks')
            if (mounted && allRes.ok && Array.isArray(allRes.data)) setBoardTasks(allRes.data)
            else {
              const raw = localStorage.getItem('boardTasks'); if (mounted) setBoardTasks(raw ? JSON.parse(raw) : [])
            }
          } catch (err) {
            const raw = localStorage.getItem('boardTasks'); if (mounted) setBoardTasks(raw ? JSON.parse(raw) : [])
          }
        }

        // 2) events list
        let ev = []
        try {
          const evRes = await authFetch('/api/events')
          if (mounted && evRes.ok && Array.isArray(evRes.data)) {
            ev = evRes.data
            setEventsList(ev)
          } else {
            const rawE = localStorage.getItem('events'); ev = rawE ? JSON.parse(rawE) : []
            if (mounted) setEventsList(ev)
          }
        } catch (err) {
          console.warn('events fetch failed', err)
          const rawE = localStorage.getItem('events'); ev = rawE ? JSON.parse(rawE) : []
          if (mounted) setEventsList(ev)
        }

        // 3) for each event, load attendance map (backend or fallback)
        const state = {}
        for (const e of ev) {
          try {
            // prefer _id when present
            const qId = e._id || e.id
            const aRes = await authFetch(`/api/attendance?eventId=${encodeURIComponent(qId)}`)
            if (aRes && aRes.ok) {
              // server likely returns array of docs; convert to map
              const raw = aRes.data
              if (Array.isArray(raw)) {
                const map = {}
                raw.forEach(item => {
                  const mid = item.member && typeof item.member === 'object' ? String(item.member._id || item.member.id) : String(item.member || item.memberId || item._id || item.id || '')
                  if (!mid) return
                  map[mid] = item.status || item.attendance || (item.present ? 'present' : 'absent')
                })
                state[e.id] = map
              } else if (raw && typeof raw === 'object') {
                // if API returned map already
                state[e.id] = raw
              } else {
                state[e.id] = {}
              }
            } else {
              const rawA = localStorage.getItem(`attendance-${e.id}`)
              state[e.id] = rawA ? JSON.parse(rawA) : {}
            }
          } catch (err) {
            const rawA = localStorage.getItem(`attendance-${e.id}`)
            state[e.id] = rawA ? JSON.parse(rawA) : {}
          }
        }
        if (mounted) setAttendanceState(state)
      } catch (err) {
        console.warn('profile data load error', err)
      }
    })()

    return () => { mounted = false }
  }, [currentMemberId])

  // completed tasks (in-memory)
  const completedTasks = useMemo(() => {
    if (!currentMemberId) return []
    return boardTasks.filter(t => String(t.assignee) === String(currentMemberId) && (t.columnId === 'done' || t.columnId === 'DEPLOYED'))
  }, [boardTasks, currentMemberId])

  const tasksCompletedCount = completedTasks.length

  // events attended count (in-memory)
  const eventsAttended = useMemo(() => {
    if (!currentMemberId) return 0
    let count = 0
    for (const ev of eventsList) {
      const map = attendanceState[ev.id] || {}
      const status = map[currentMemberId] || map[String(currentMemberId)] || 'not marked'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMemberId, currentMemberName])

  const handleLogout = () => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('currentMemberId')
      localStorage.removeItem('currentMemberName')
    } catch (e) {}
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
    // NOTE: no persistence here (you asked to remove localStorage).
  }

  return (
    <MainLayout hudType="profile">
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">MY PROFILE</h2>
          <div className="mt-4 md:mt-0 md:w-50">
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