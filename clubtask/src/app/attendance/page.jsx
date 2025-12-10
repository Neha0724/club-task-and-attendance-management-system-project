"use client";

import MainLayout from '@/components/MainLayout'

export default function Attendance() {
  const attendanceLog = [
    { date: 'DEC 25', title: 'Workshop', type:'Present', color: 'green' },
    { date: 'NOV 12', title: 'Git for Geeks', type:'Present', color: 'green' },
    { date: 'SEP 16', title: 'AI workshop', type:'Absent', color: 'red' },
    { date: 'FEB 07', title: 'Smakthone', type:'Present', color: 'green' },
    { date: 'OCT 20', title: 'Meet', type:'Present', color: 'blue' }
  ]
  
  return (
    <MainLayout hudType="attendance">
      <div className='p-6 mx-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-3xl mx-auto font-bold text-white'>ATTENDANCE_LOG</h2>

          <button className='bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-6 rounded transition-all duration-200 shadow-lg hover:shadow-green-500/50'>&gt;[ GENERATE .CSV FILE ]</button>
        </div>

        <div className='grid grid-rows gap-6'>
          {attendanceLog.map((attendance, idx) => (
            <div 
              key={idx}
              className= {`border-2 ${
                attendance.color === 'green' ? 'border-green-500 bg-green-950/20' :
                attendance.color === 'blue' ? 'border-blue-500 bg-blue-950/20' :
                'border-red-500 bg-red-950/20'
              } rounded-lg p-4 relative transition-all duration-200 hover:scale-95 hover:shadow-xl cursor-pointer`}
            >
              <div className='flex items-center justify-between mb-3'>
                <div className=''>
                  <span className='text-grey-400 text-sm font-bold'>{attendance.date}</span>
                
                <span>
                  <h3 className="text-white font-bold mb-2">{attendance.title}</h3>
                </span>
                </div>

                <span>
                  <button className="border border-white text-white flex items-center px-5 py-3 rounded text-sm hover:bg-green-500/10 transition-colors">
                {attendance.type}
                </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}