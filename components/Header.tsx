'use client'

import Link from 'next/link'
import { ThemeSwitcher } from './ThemeSwitcher'
import { BookOpen } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 justify-between md:justify-start">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <BookOpen className="w-6 h-6 text-accent" />
          <span className="hidden md:inline font-arabic">المكتبة العلمية</span>
        </Link>
        
        <nav className="hidden md:flex flex-1 items-center justify-center gap-6 font-arabic-sans">
          <Link 
            href="/topics" 
            className="text-sm font-medium transition-colors hover:text-accent"
          >
            المواضيع
          </Link>
          <Link 
            href="/books" 
            className="text-sm font-medium transition-colors hover:text-accent"
          >
            الكتب
          </Link>
          <Link 
            href="/search" 
            className="text-sm font-medium transition-colors hover:text-accent"
          >
            البحث
          </Link>
          <Link 
            href="/download" 
            className="text-sm font-medium transition-colors hover:text-accent"
          >
            سطح المكتب
          </Link>
          <Link 
            href="/donate" 
            className="text-sm font-medium transition-colors hover:text-accent"
          >
            تبرع
          </Link>
          <Link 
            href="/about" 
            className="text-sm font-medium transition-colors hover:text-accent"
          >
            عن المشروع
          </Link>
        </nav>
        
        <div className="ml-auto">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}

