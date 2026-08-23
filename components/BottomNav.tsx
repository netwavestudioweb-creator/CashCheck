'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, History, User } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  // Hide nav on login, onboarding, and paywall
  if (pathname === '/login' || pathname === '/onboarding' || pathname === '/paywall' || pathname === '/') {
    return null
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Historique', href: '/historique', icon: History },
    { name: 'Compte', href: '/compte', icon: User },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] md:hidden pb-safe">
      <nav className="flex items-center justify-around px-4 sm:px-6 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex flex-col items-center gap-1 min-w-[64px]"
            >
              <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-[#EAF3FA]' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-gray-400'}`} />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-accent' : 'text-gray-400'}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
