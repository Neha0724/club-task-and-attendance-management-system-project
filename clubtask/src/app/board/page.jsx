'use client';

import MainLayout from '@/components/MainLayout'

export default function BoardPage() {
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
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">PROJECT_BOARD</h2>
          <button className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-3 rounded transition-all duration-200 shadow-lg hover:shadow-green-500/50">
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