'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    router.push('/board')
  }

  return (
    <div className="min-h-screen bg-linear-to-r from-gray-900 via-black to-gray-900">
      <Header />
      
      <div className="flex items-center justify-center h-[calc(100vh-88px)] bg-pattern">
        <div className="w-full max-w-2xl px-4">
          <div className="border-2 border-blue-500/50 rounded-lg bg-gray-900/80 backdrop-blur p-8 shadow-2xl shadow-blue-500/20">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2 ">LOGIN_MODULE</h2>
              <p className="text-green-400">&gt; AUTHENTICATE_USER</p>
            </div>

            <div className="space-y-6">
              <div>
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
                <label className="block text-white mb-2 font-bold">PASSWORD</label>
                <input
                  type="password"
                  placeholder="> enter_password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded px-4 py-3 text-gray-400 placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleLogin}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-6 rounded transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/50"
                >
                  <span>👑</span> [ AS A LEAD ]
                </button>
                <button
                  onClick={handleLogin}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-6 rounded transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/50"
                >
                  <span>👤</span> [ AS A MEMBER ]
                </button>
              </div>

              <div className="flex justify-between text-sm">
                <button className="text-green-400 hover:text-green-300 transition-colors">
                  &gt; forgot_password?
                </button>
                <button className="text-green-400 hover:text-green-300 transition-colors">
                  &gt; request_access
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}