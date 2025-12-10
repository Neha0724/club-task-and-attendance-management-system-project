"use client";

import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function LeadPage () {
  const router = useRouter()
  const handleDomain = () => {
    router.push('/memberlist')
  }

  const domains = [
    {title :'TECHNICAL_TEAM'},
    {title :'MANAGEMENT_TEAM'},
    {title :'PUBLIC_RELATION_TEAM'},
    {title :'GRAPHICS_TEAM'},
    {title :'MEDIA_TEAM'}
  ]
  return (
    <div className="min-h-screen bg-linear-to-r from-gray-900 via-black to-gray-900">
      <Header />

      <div className='p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-3xl font-bold text-white'>ALL_ DOMAINS</h2>
        </div>

        <div className='grid grid-cols-5 gap-3'>
          {domains.map((domain, idx) => (
            <div
            key={idx}
            className='w-60 aspect-square border-2 border-green-500 bg-green-950/20 rounded-lg text-center p-4 transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer'>

              <div>
                <h3 className='text-white font-bold mb-40'>{domain.title}</h3>

                <button 
                onClick={handleDomain}
                className="border border-green-500 text-green-400 py-1 rounded text-sm hover:bg-green-500/10 transition-colors">
                [ LOOK MORE ]
              </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}