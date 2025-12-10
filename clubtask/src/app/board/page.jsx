'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout'

function FloatingOverlay({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Background blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Floating card */}
      <div className="relative bg-gray-900 border border-green-500/40 rounded-xl shadow-2xl w-[360px] p-6 z-50">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-sm bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 text-white"
        >
          X
        </button>

        {children}
      </div>
    </div>
  );
}
/*------board page----------*/
export default function BoardPage() {
  const router = useRouter()

  const [openOverlay, setOpenOverlay] = useState(false);
  const handleNewTask = () => {
  setOpenOverlay(true);
};


  const columns = [
    {
      title: 'INITIALIZE',
      subtitle: '[Backlog]',
      tasks: [
        { title: 'Team Project PPT', timeline: '12-12-25', color: 'red' },
        { title: 'Team Project', timeline: '12-12-25', color: 'red' },
        { title: 'Territory Event', timeline: '09-01-36', color: 'red' },
        { title: 'Territory Event', timeline: '20-01-26', color: 'red' }
      ]
    },
    {
      title: 'RUNNING PROCESSES',
      subtitle: '[In Progress]',
      tasks: [
        { title: 'Team Project', timeline: '12-12-25', color: 'orange' },
        { title: 'Team Project', timeline: '12-12-25', color: 'orange' }
      ]
    },
    {
      title: 'DEPLOYED',
      subtitle: '[Done]',
      tasks: [
        { title: 'Workshop PPT', timeline: '30-08-25', color: 'blue' },
        { title: 'Geeks-git 4.0', timeline: '05-10-25', color: 'blue' },
        { title: 'Final Event PPT presentation', timeline: '17-09-25', color: 'blue' }
      ]
    }
  ]

  const getTaskBorderColor = (color) => {
    const colors = {
      red: 'border-red-500',
      orange: 'border-orange-500',
      blue: 'border-blue-500',
      green: 'border-green-500'
    }
    return colors[color] || 'border-gray-500'
  }

  const getTaskBgColor = (color) => {
    const colors = {
      red: 'bg-red-950/30',
      orange: 'bg-orange-950/30',
      blue: 'bg-blue-950/30',
      green: 'bg-green-950/30'
    }
    return colors[color] || 'bg-gray-950/30'
  }

  return (
    <MainLayout hudType="board">
      
      <FloatingOverlay open={openOverlay} onClose={() => setOpenOverlay(false)}>
      <h2 className="text-green-400 font-bold text-lg mb-4">EXECUTE NEW TASK</h2>

      <input
      type="text"
      placeholder="Task Title"
      className="w-full mb-3 px-3 py-2 rounded bg-gray-800 border border-green-700 text-white"
      />

      <input
      type="date"
      className="w-full mb-3 px-3 py-2 rounded bg-gray-800 border border-green-700 text-white"
      />

      <input
      type="color-text"
      placeholder="choose colour"
      className="w-full mb-3 px-3 py-2 rounded bg-gray-800 border border-green-700 text-white"
      />

  <button
    className="w-full bg-green-600 hover:bg-green-700 text-black font-bold py-2 rounded mt-2"
    onClick={() => setOpenOverlay(false)}
  >
    SAVE TASK
  </button>
</FloatingOverlay>


      <div className="p-6 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">PROJECT_BOARD</h2>
          <button
            onClick={handleNewTask}
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-3 rounded transition-all duration-200 shadow-lg hover:shadow-green-500/50">
            [ + EXECUTE NEW TASK ]
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8 p-6">
          {columns.map((column, idx) => (
            <div key={idx} className="space-y-3">
              <div className="border border-green-900/50 rounded-lg p-3 bg-gray-900/30">
                <h3 className="text-white font-bold">&gt;_ {column.title}</h3>
                <p className="text-green-700 text-sm">{column.subtitle}</p>
              </div>
              <div className="space-y-3">
                {column.tasks.map((task, taskIdx) => (
                  <div
                    key={taskIdx}
                    className={`border-2 ${getTaskBorderColor(task.color)} ${getTaskBgColor(task.color)} rounded-lg p-4 transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer`}
                  >
                    <p className="text-gray-400 text-xs mb-2">{task.id}</p>
                    <p className="text-white text-sm mb-3">{task.title}</p>
                    <span className="text-green-600 text-xs">{task.timeline}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}