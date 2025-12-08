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
            <span className="text-green-400">GFG</span> NEXUS COMMAND
          </h1>
        </div>
        
        <div className="flex-1 max-w-md mx-8">
          <input
            type="text"
            placeholder=">_ query system database..."
            className="w-full bg-gray-900/50 border border-green-900/50 rounded px-4 py-2 text-green-400 placeholder-green-700 focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>
        
        <div className="w-12 h-12 border border-green-500 rounded-lg flex items-center justify-center hover:bg-green-500/10 transition-colors cursor-pointer">
          <span className="text-green-400 text-xs font-bold">[JD]</span>
        </div>
      </div>
    </div>
  )
}