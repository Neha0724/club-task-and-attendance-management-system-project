'use client'

import MainLayout from '@/components/MainLayout'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()

  const handleLogout = () => {
    router.push('/login')
  }

  return (
    <MainLayout hudType="profile">
      <div className="p-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-white">MY_PROFILE</h2>
          <button className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-6 rounded transition-all duration-200 shadow-lg hover:shadow-green-500/50">
            &gt;[VIEW MYPROFILE]
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* User Profile */}
          <div className="space-y-6">
            <div className="bg-gray-900/30 border border-green-900/50 rounded-lg p-6">
              <h3 className="text-white font-bold mb-4">USER_PROFILE: <span className="text-green-400">[JD]</span></h3>
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 border-4 border-green-500 rounded-full flex items-center justify-center mb-4 shadow-2xl shadow-green-500/30 relative">
                  <span className="text-green-400 text-3xl font-bold">[NT]</span>
                  <div className="absolute inset-0 border-4 border-green-500/20 rounded-full animate-ping"></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="border-2 border-green-500 bg-green-950/20 rounded-lg p-4 hover:bg-green-950/30 transition-colors">
                  <p className="text-gray-400 text-sm mb-1">TASKS_COMPLETED:</p>
                  <p className="text-white text-2xl font-bold">145</p>
                </div>
                <div className="border-2 border-green-500 bg-green-950/20 rounded-lg p-4 hover:bg-green-950/30 transition-colors">
                  <p className="text-gray-400 text-sm mb-1">EVENTS_ATTENDED:</p>
                  <p className="text-white text-2xl font-bold">23</p>
                </div>
                <div className="border-2 border-green-500 bg-green-950/20 rounded-lg p-4 hover:bg-green-950/30 transition-colors">
                  <p className="text-gray-400 text-sm mb-1">MEMBER_SINCE:</p>
                  <p className="text-white text-2xl font-bold">2021</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Settings */}
          <div className="bg-gray-900/30 border border-green-900/50 rounded-lg p-6">
            <h3 className="text-white font-bold mb-6">PERSONAL_SETTINGS</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2 text-sm font-bold">Email</label>
                <input
                  type="email"
                  value="yoirnoholm@gmail.com"
                  className="w-full bg-black/50 border border-gray-700 rounded px-4 py-2 text-gray-400 focus:outline-none focus:border-green-500 transition-colors"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-white mb-2 text-sm font-bold">Domain</label>
                <textarea
                  className="w-full bg-black/50 border border-gray-700 rounded px-2 py-2 text-gray-400 h-12 focus:outline-none focus:border-green-500 transition-colors resize-none"
                  value="Technical Team Member"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-white mb-2 text-sm font-bold">BIO</label>
                <textarea
                  className="w-full bg-black/50 border border-gray-700 rounded px-4 py-2 text-gray-400 h-32 focus:outline-none focus:border-green-500 transition-colors resize-none"
                  value="Hello I'm Neha Tated. Technical Team Member"
                  readOnly
                />
              </div>
              <button 
                onClick={handleLogout}
                className="w-full bg-red-900/50 hover:bg-red-900/70 border border-red-500 text-red-400 font-bold py-2 rounded transition-all duration-200 hover:shadow-lg hover:shadow-red-500/50"
              >
                [ LOG_OUT ]
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}