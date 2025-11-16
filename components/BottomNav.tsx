'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, List, Search, Download, Heart } from 'lucide-react'

const navItems = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/topics', label: 'المواضيع', icon: List },
  { href: '/books', label: 'الكتب', icon: BookOpen },
  { href: '/search', label: 'البحث', icon: Search },
  { href: '/download', label: 'سطح المكتب', icon: Download },
  { href: '/donate', label: 'تبرع', icon: Heart },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border backdrop-blur-lg supports-[backdrop-filter]:bg-card/95 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-0 flex-1 transition-colors ${
                isActive 
                  ? 'text-accent' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-arabic-sans">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

