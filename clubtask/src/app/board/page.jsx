'use client'

import { useEffect, useState } from 'react'
import MainLayout from '@/components/MainLayout'

function FloatingOverlay({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-gray-900 border border-green-500/40 rounded-xl shadow-2xl w-[92%] sm:w-[420px] p-5 z-50 mx-4">
        <button onClick={onClose} className="absolute top-2 right-2 text-sm bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 text-white">X</button>
        {children}
      </div>
    </div>
  )
}

export default function BoardPage() {
  const [openOverlay, setOpenOverlay] = useState(false)

  // new task form
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDate, setTaskDate] = useState('')
  const [taskColumn, setTaskColumn] = useState('backlog') // backlog | inprogress | done

  const [boardTasks, setBoardTasks] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('boardTasks')
      const arr = raw ? JSON.parse(raw) : []
      setBoardTasks(arr)
    } catch (e) {
      console.warn(e); setBoardTasks([])
    }
  }, [])

  const persistBoardTasks = (arr) => {
    localStorage.setItem('boardTasks', JSON.stringify(arr))
    setBoardTasks(arr)
  }

  const uid = (p='') => p + Date.now().toString(36).slice(-6)

  const handleSaveTask = () => {
    if (!taskTitle.trim()) return alert('Enter task title')
    const newTask = {
      title: taskTitle.trim(),
      timeline: taskDate || new Date().toLocaleDateString(),
      columnId: taskColumn, // backlog, inprogress, done
      createdAt: new Date().toISOString()
    }
    const updated = [newTask, ...boardTasks]
    persistBoardTasks(updated)
    // reset form + close
    setTaskTitle(''); setTaskDate(''); setTaskColumn('backlog'); setOpenOverlay(false)
  }

  // fixed color helpers by column
  const borderForColumn = (col) => {
    if (col === 'backlog') return 'border-red-500'
    if (col === 'inprogress') return 'border-blue-500'
    if (col === 'done') return 'border-green-500'
    return 'border-gray-500'
  }
  const bgForColumn = (col) => {
    if (col === 'backlog') return 'bg-red-950/20'
    if (col === 'inprogress') return 'bg-blue-950/20'
    if (col === 'done') return 'bg-green-950/20'
    return 'bg-gray-900/20'
  }

  const backlog = boardTasks.filter(t => t.columnId === 'backlog')
  const inprogress = boardTasks.filter(t => t.columnId === 'inprogress')
  const done = boardTasks.filter(t => t.columnId === 'done')

  return (
    <MainLayout hudType="board">
      <FloatingOverlay open={openOverlay} onClose={() => setOpenOverlay(false)}>
        <h2 className="text-green-400 font-bold text-lg mb-3">EXECUTE NEW TASK</h2>

        <input value={taskTitle} onChange={(e)=>setTaskTitle(e.target.value)} type="text" placeholder="Task Title"
          className="w-full mb-3 px-3 py-2 rounded bg-gray-800 border border-green-700 text-white" />

        <div className="flex gap-2 mb-3">
          <input value={taskDate} onChange={(e)=>setTaskDate(e.target.value)} type="date"
            className="flex-1 px-3 py-2 rounded bg-gray-800 border border-green-700 text-white" />
        </div>

        <label className="block text-sm text-gray-300 mb-2">Which column?</label>
        <select value={taskColumn} onChange={(e)=>setTaskColumn(e.target.value)} className="w-full mb-3 px-3 py-2 rounded bg-gray-800 border border-green-700 text-white">
          <option value="backlog">Backlog</option>
          <option value="inprogress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <button onClick={handleSaveTask} className="w-full bg-green-600 hover:bg-green-700 text-black font-bold py-2 rounded mt-2">SAVE TASK</button>
      </FloatingOverlay>

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">PROJECT_BOARD</h2>
          <button onClick={()=>setOpenOverlay(true)} className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-3 sm:px-4 rounded transition-all">[ + EXECUTE NEW TASK ]</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Backlog (red) */}
          <div className="space-y-3">
            <div className="border border-green-900/50 rounded-lg p-3 bg-gray-900/30">
              <h3 className="text-white font-bold">INITIALIZE</h3>
              <p className="text-green-700 text-sm">[Backlog]</p>
            </div>
            <div className="space-y-3">
              {backlog.map((task,idx) => (
                <div key={idx} className={`border-2 ${borderForColumn('backlog')} ${bgForColumn('backlog')} rounded-lg p-4 transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer`}>
                  <p className="text-white text-sm mb-3">{task.title}</p>
                  <span className="text-green-600 text-xs">{task.timeline}</span>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress (blue) */}
          <div className="space-y-3">
            <div className="border border-green-900/50 rounded-lg p-3 bg-gray-900/30">
              <h3 className="text-white font-bold">RUNNING PROCESSES</h3>
              <p className="text-green-700 text-sm">[In Progress]</p>
            </div>
            <div className="space-y-3">
              {inprogress.map((task,idx) => (
                <div key={idx} className={`border-2 ${borderForColumn('inprogress')} ${bgForColumn('inprogress')} rounded-lg p-4 transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer`}>
                  <p className="text-white text-sm mb-3">{task.title}</p>
                  <span className="text-green-600 text-xs">{task.timeline}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Done (green) */}
          <div className="space-y-3">
            <div className="border border-green-900/50 rounded-lg p-3 bg-gray-900/30">
              <h3 className="text-white font-bold">DEPLOYED</h3>
              <p className="text-green-700 text-sm">[Done]</p>
            </div>
            <div className="space-y-3">
              {done.map((task,idx) => (
                <div key={idx} className={`border-2 ${borderForColumn('done')} ${bgForColumn('done')} rounded-lg p-4 transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer`}>
                  <p className="text-white text-sm mb-3">{task.title}</p>
                  <span className="text-green-600 text-xs">{task.timeline}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
