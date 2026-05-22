'use client'

import Link from 'next/link'
import { ThemeSwitcher } from './ThemeSwitcher'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useLanguage } from './LanguageProvider'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header() {
  const { t, dir } = useLanguage()
  const nav = t.nav

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 justify-between md:justify-start gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl shrink-0">
          <BookOpen className="w-6 h-6 text-accent" />
          <span className={cn('hidden md:inline', dir === 'rtl' && 'font-arabic')}>{nav.siteName}</span>
        </Link>
        
        <nav className={cn('hidden md:flex flex-1 items-center justify-center gap-6', dir === 'rtl' && 'font-arabic-sans')}>
          <Link 
            href="/topics" 
            className="text-sm font-medium transition-colors hover:text-accent"
          >
            {nav.topics}
          </Link>
          <Link 
            href="/books" 
            className="text-sm font-medium transition-colors hover:text-accent"
          >
            {nav.books}
          </Link>
          <Link 
            href="/search" 
            className="text-sm font-medium transition-colors hover:text-accent"
          >
            {nav.search}
          </Link>
          <Link 
            href="/download" 
            className="text-sm font-medium transition-colors hover:text-accent"
          >
            {nav.download}
          </Link>
          <Link 
            href="/donate" 
            className="text-sm font-medium transition-colors hover:text-accent"
          >
            {nav.donate}
          </Link>
          <Link 
            href="/about" 
            className="text-sm font-medium transition-colors hover:text-accent"
          >
            {nav.about}
          </Link>
        </nav>
        
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
