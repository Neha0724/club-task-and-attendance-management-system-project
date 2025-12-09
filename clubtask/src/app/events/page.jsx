'use client';

import MainLayout from '@/components/MainLayout'

export default function EventsPage() {
  const events = [
    { date: 'SEP 15', title: 'Workshop', time: '3:00 PM', location: 'DT 902', live: true, color: 'green' },
    { date: 'DAY 23', title: 'Git for Geeks', time: '3:00 PM', location: 'DT 112', live: true, color: 'orange' },
    { date: 'SEP 19', title: 'AI workshop', time: '5:00 PM', location: 'DT 702', live: true, color: 'red' },
    { date: 'DED 29', title: 'Smakthone', time: '9:00 PM', location: 'YCCE', live: false, color: 'blue' },
    { date: 'DAY 30', title: 'HACKATHON', time: '8:00 PM', location: 'IIITN', live: false, color: 'orange' }
  ]

  const timelinePoints = [
    { date: 'DET 25', color: 'green' },
    { date: 'SEP 26', color: 'orange' },
    { date: 'OCT 21', color: 'gray', active: true },
    { date: 'NOV 09', color: 'blue' },
    { date: 'OCT 23', color: 'orange' }
  ]

  return (
    <MainLayout hudType="events">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">EVENT_TIMELINE</h2>
          <button className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-6 rounded transition-all duration-200 shadow-lg hover:shadow-green-500/50">
            &gt;[ UPCOMING_SCHEDULE ]
          </button>
        </div>

        {/* Timeline */}
        <div className="mb-8 bg-gray-900/30 border border-green-900/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            {timelinePoints.map((point, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className={`px-3 py-1 rounded ${point.active ? 'bg-blue-500/20 border border-blue-500' : 'bg-gray-800'} text-xs text-gray-400 mb-2`}>
                  {point.date}
                </div>
                <div className={`w-4 h-4 rounded-full ${
                  point.color === 'green' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 
                  point.color === 'orange' ? 'bg-orange-500 shadow-lg shadow-orange-500/50' : 
                  point.color === 'blue' ? 'bg-blue-500 shadow-lg shadow-blue-500/50' : 
                  'bg-gray-500'
                }`}></div>
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-700 rounded-full relative overflow-hidden">
            <div className="absolute h-full bg-linear-to-r from-green-500 via-orange-500 to-blue-500 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-5 gap-6">
          {events.map((event, idx) => (
            <div
              key={idx}
              className={`border-2 ${
                event.color === 'green' ? 'border-green-500 bg-green-950/20' :
                event.color === 'orange' ? 'border-orange-500 bg-orange-950/20' :
                event.color === 'blue' ? 'border-blue-500 bg-blue-950/20' :
                'border-red-500 bg-red-950/20'
              } rounded-lg p-4 relative transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm font-bold">{event.date}</span>
                {event.live && (
                  <span className="flex items-center gap-1 text-red-400 text-xs">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                )}
              </div>
              <h3 className="text-white font-bold mb-2">{event.title}</h3>
              <p className="text-gray-400 text-sm mb-1">Time: {event.time}</p>
              <p className="text-gray-400 text-sm mb-4">Location: {event.location}</p>
              <button className="w-full border border-green-500 text-green-400 py-1 rounded text-sm hover:bg-green-500/10 transition-colors">
                [ REGISTER ]
              </button>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}