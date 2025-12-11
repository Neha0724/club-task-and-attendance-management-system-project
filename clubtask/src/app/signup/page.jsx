'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

const uid = (prefix = '') => prefix + Date.now().toString(36).slice(-6)

export default function SignUpPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [domain, setDomain] = useState('')
  const [position, setPosition] = useState('')
  const [password, setPassword] = useState('')

  const handleSignup = () => {
    if (!username.trim()) return alert('Enter username')
    if (!email.trim()) return alert('Enter email')
    // Save minimal profile to localStorage so other pages can pick it up
    const memberId = uid('m-')
    localStorage.setItem('profileName', username.trim())
    localStorage.setItem('email', email.trim())
    localStorage.setItem('position', position || 'Member')
    localStorage.setItem('domain', domain || '')
    localStorage.setItem('memberSince', new Date().getFullYear().toString())
    localStorage.setItem('profileBio', '')
    // role: lead if position === 'Lead', else member
    localStorage.setItem('userRole', (position === 'Lead' || position === 'lead') ? 'lead' : 'member')
    // store a currentMemberId so profile/attendance detection works
    localStorage.setItem('currentMemberId', memberId)
    // also store a simple account object (frontend-only)
    localStorage.setItem('account-' + memberId, JSON.stringify({ id: memberId, name: username.trim(), email: email.trim(), position: position || 'Member', domain: domain || '' }))
    // navigate to board
    router.push('/board')
  }

  return (
    <div className="min-h-screen bg-linear-to-r from-gray-900 via-black to-gray-900">
      <Header />

      <div className="flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-3xl">
          <div className="border-2 border-blue-500/50 rounded-lg bg-gray-900/80 backdrop-blur p-6 sm:p-8 shadow-2xl shadow-blue-500/20">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">SIGNUP MODULE</h2>
              <p className="text-sm text-green-400">&gt; CREATE YOUR ACCOUNT</p>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); handleSignup() }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="md:col-span-2">
                <label className="block text-white mb-2 font-bold">USERNAME</label>
                <input
                  type="text"
                  placeholder="> enter_username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/50 border-2 border-green-500 rounded px-4 py-3 text-green-400 placeholder-green-700 focus:outline-none focus:border-green-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-bold">EMAIL</label>
                <input
                  type="email"
                  placeholder="> enter_email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border-2 border-green-500 rounded px-4 py-3 text-green-400 placeholder-green-700 focus:outline-none focus:border-green-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-bold">PASSWORD</label>
                <input
                  type="password"
                  placeholder="> enter_password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border-2 border-green-700 rounded px-4 py-3 text-green-700 placeholder-green-600 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              {/* Domain select (separate) */}
              <div>
                <label className="block text-white mb-2 font-bold">DOMAIN</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-black/50 border-2 border-green-700 rounded px-4 py-3 text-green-400 focus:outline-none focus:border-green-500 transition-colors"
                >
                  <option value="">Select domain</option>
                  <option value="Technical">Technical</option>
                  <option value="Management">Management</option>
                  <option value="Public Relation">Public Relation</option>
                  <option value="Graphics">Graphics</option>
                  <option value="Media">Media</option>
                </select>
              </div>

              {/* Position select (separate) */}
              <div>
                <label className="block text-white mb-2 font-bold">POSITION</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-black/50 border-2 border-green-700 rounded px-4 py-3 text-green-400 focus:outline-none focus:border-green-500 transition-colors"
                >
                  <option value="">Select position</option>
                  <option value="President">President</option>
                  <option value="Vice-President">Vice-President</option>
                  <option value="Lead">Lead</option>
                  <option value="Member">Member</option>
                </select>
              </div>

              <div className="md:col-span-2 flex justify-center mt-2">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-8 rounded transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-green-500/50"
                >
                  [ SIGN UP ]
                </button>
              </div>
            </form>

            <p className="mt-4 text-xs text-gray-400">Note: This is frontend-only signup. Data is stored locally in your browser for demo/testing purposes.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
