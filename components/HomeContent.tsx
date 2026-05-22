'use client'

import Link from 'next/link'
import { BookOpen, List, Search } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'
import { cn } from '@/lib/utils'

interface HomeContentProps {
  visitorCount: number
}

export function HomeContent({ visitorCount }: HomeContentProps) {
  const { t, dir } = useLanguage()
  const home = t.home
  const formattedVisitorCount = new Intl.NumberFormat('en-US').format(visitorCount)

  return (
    <div className="min-h-screen flex flex-col items-center md:justify-center px-4 pt-6 pb-24 md:py-12 home-page-content">
      <div className="max-w-4xl w-full space-y-6 md:space-y-12 animate-fade-in">
        <div className={cn('text-center space-y-3 md:space-y-6', dir === 'rtl' && 'font-arabic-sans')}>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground">{home.title}</h1>
          <p className="text-lg md:text-2xl text-muted-foreground">{home.subtitle}</p>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto hidden md:block">
            {home.description}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-3 md:gap-6">
          <Link href="/topics" className="group">
            <div className="card p-4 md:p-7 lg:p-8 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="flex items-center gap-3 md:flex-col md:text-center md:space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                  <List className="w-6 h-6 md:w-8 md:h-8 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
                </div>
                <div className={cn('flex-1 md:flex-none', dir === 'rtl' && 'font-arabic-sans')}>
                  <h2 className="text-lg md:text-2xl font-bold">{home.browseTopics}</h2>
                  <p className="text-sm md:text-base text-muted-foreground hidden md:block mt-2">
                    {home.browseTopicsDesc}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/books" className="group">
            <div className="card p-4 md:p-7 lg:p-8 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="flex items-center gap-3 md:flex-col md:text-center md:space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                  <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
                </div>
                <div className={cn('flex-1 md:flex-none', dir === 'rtl' && 'font-arabic-sans')}>
                  <h2 className="text-lg md:text-2xl font-bold">{home.browseBooks}</h2>
                  <p className="text-sm md:text-base text-muted-foreground hidden md:block mt-2">
                    {home.browseBooksDesc}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/search" className="group">
            <div className="card p-4 md:p-7 lg:p-8 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="flex items-center gap-3 md:flex-col md:text-center md:space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                  <Search className="w-6 h-6 md:w-8 md:h-8 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
                </div>
                <div className={cn('flex-1 md:flex-none', dir === 'rtl' && 'font-arabic-sans')}>
                  <h2 className="text-lg md:text-2xl font-bold">{home.advancedSearch}</h2>
                  <p className="text-sm md:text-base text-muted-foreground hidden md:block mt-2">
                    {home.advancedSearchDesc}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className={cn('text-center space-y-1 md:space-y-4', dir === 'rtl' && 'font-arabic-sans')}>
          <p className="text-sm text-muted-foreground hidden md:block">{home.footerNote}</p>
          <p className="text-sm text-muted-foreground flex flex-wrap items-center justify-center gap-x-1">
            <span className="font-semibold text-foreground">{formattedVisitorCount}</span>
            <span>{home.totalVisitors}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
