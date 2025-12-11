'use client'

export default function Header() {
  return (
    <div className="border-b border-green-900/50 bg-black/95 backdrop-blur sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
            <span className="text-green-400 font-bold text-xs">GFG</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            <span className="text-green-400">GFG</span> CLUB COMMAND
          </h1>
        </div>
      </div>
    </div>
  )
}