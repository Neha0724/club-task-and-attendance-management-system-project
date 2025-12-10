"use client";

import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function MemberList () {
  const Members = [
    {name: 'NEHA TATED'},
    {name: 'VARAD RAUT'},
    {name: 'SARVESH HARDAS'},
    {name: 'ARYA'},
    {name: 'KRISH PAROTHI'},
    {name: 'SHARDUL'},
    {name: 'SOUMYA'},
    {name: 'VARUNVI'},
  ]
  
  const router = useRouter()

  const handleMember = () => {
    router.push('/board')
  }

  return (
    <div className="min-h-screen bg-linear-to-r from-gray-900 via-black to-gray-900">
      <Header />
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">MEMBER_LIST</h2>
        </div>

        <div className='grid grid-rows'>
          {Members.map((member,idx) => (
            <div 
            key={idx}
            className='border-2 border-green-500 bg-green-950/20 rounded-lg p-3 mb-3 m-6 relative transition-all duration-200 hover:scale-95 hover:shadow-xl cursor-pointer'>

              <div className='flex items-center justify-between'>
                <div>
                  <h3 className="text-white font-bold mb-2">{member.name}</h3>
                </div>

                <span>
                  <button 
                  onClick={handleMember}
                  className="border border-white text-white flex items-center px-4 py-2 rounded text-sm hover:bg-green-500/10 transition-colors">
                  MEMBER_BOARD
                  </button>
                </span>
              </div>
           </div>
          ))}
       </div>
  </div>
  )
}