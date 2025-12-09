"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"

export default function SignUpPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [position, setPosition] = useState('')
  const [password, setPassword] = useState('')


  const handleSignup = () => {
    router.push('/board')
  }

  return (
    <div className="min-h-screen bg-linear-to-r from-gray-900 via-black to-gray-900">
      <Header />

      <div className="flex items-center justify-center h-[calc(100vh-88px)] bg-pattern">
        <div className="w-full max-w-2xl px-4">
          <div className="border-2 border-blue-500/50 rounded-lg bg-gray-900/80 backdrop-blur p-8 shadow-2xl shadow-blue-500/20">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">SIGNUP_MODULE</h2>
              <p className="text-green-400">&gt;AUTHENTICATE_USER</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2 font-bold">USERNAME</label>
                <input
                type='text'
                placeholder="> enter_username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border-2 border-green-500 rounded px-4 py-3 text-green-400 placeholder-green-700 focus:outline-none focus:border-green-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-bold">EMAIL</label>
                <input
                type='email'
                placeholder="> enter_email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border-2 border-green-500 rounded px-4 py-3 text-green-400 placeholder-green-700 focus:outline-none focus:border-green-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-bold">POSITION</label>
                <select
                placeholder="> select_position..."
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
                className="w-full bg-black/50 border-2 border-green-700 rounded px-4 py-3 text-green-700 placeholder-green-700 focus:outline-none focus:border-green-500 transition-colors">
                  <option value="">select_position</option>
                  <option value="President">PRESIDENT</option>
                  <option value="vice_president">VICE_PRESIDENT</option>
                  <option value="technical">TECHNICAL</option>
                  <option value="management">MANAGEMENT</option>
                  <option value="public_relation">PUBLIC_RELATION</option>
                  <option value="graphics">GRAPHICS</option>
                  <option value="media">MEDIA</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-bold mb-2">PASSWORD</label>

                <input
                  type="password"
                  placeholder="> enter_password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border-2 border-green-700 rounded px-4 py-3 text-green-700 placeholder-green-600 focus:outline-none focus:border-green-500 transition-colors"                
                />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSignup}
                  className=" bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-10 rounded transition-all duration-200flex items-center justify-center shadow-lg hover:shadow-green-500/50"
                >
                  [SIGN UP]
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}