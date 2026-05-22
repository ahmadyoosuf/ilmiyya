'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, List, Search, Download, Info, Heart } from 'lucide-react'
import { useLanguage } from './LanguageProvider'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()
  const { t, dir } = useLanguage()
  const nav = t.nav

  const navItems = [
    { href: '/', label: nav.home, icon: Home },
    { href: '/topics', label: nav.topics, icon: List },
    { href: '/books', label: nav.books, icon: BookOpen },
    { href: '/search', label: nav.search, icon: Search },
    { href: '/download', label: nav.download, icon: Download },
    { href: '/about', label: nav.about, icon: Info },
    { href: '/donate', label: nav.donate, icon: Heart },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border backdrop-blur-lg supports-[backdrop-filter]:bg-card/95" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
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
              <span className={cn('text-xs', dir === 'rtl' && 'font-arabic-sans')}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
