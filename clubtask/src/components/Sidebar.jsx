'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Layout, Calendar, User, Settings } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/board', icon: Layout, label: 'PROJECT_BOARD' },
    { href: '/events', icon: Calendar, label: 'EVENTS' },
    { href: '/profile', icon: User, label: 'PROFILE' },
  ]

  return (
    <div className="w-26 border-r border-green-900/50 bg-black/50 flex flex-col items-center py-3 gap-5 h-full">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`p-3 rounded-lg transition-all duration-200 ${
              isActive 
                ? 'bg-green-500/20 text-green-400 border-glow' 
                : 'text-green-700 hover:text-green-400 hover:bg-green-500/10'
            }`}
          >
            <Icon size={19} />
          </Link>
        )
      })}
      
      <button className="p-3 text-green-700 hover:text-green-400 hover:bg-green-500/10 transition-all duration-200 rounded-lg mt-auto">
        <Settings size={24} />
      </button>
      
      <div className="text-green-500 text-xs text-center border-t border-green-900/50 pt-4 w-full">
        {pathname === '/board' && 'PROJECT_BOARD'}
        {pathname === '/events' && 'EVENTS'}
        {pathname === '/profile' && 'PROFILE'}
      </div>
    </div>
  )
}