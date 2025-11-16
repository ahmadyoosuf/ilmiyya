'use client'

import { Language, languages } from '@/lib/i18n/types'
import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface LanguageSwitcherProps {
  currentLanguage: Language
  onLanguageChange: (lang: Language) => void
}

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  const currentLang = languages.find(l => l.code === currentLanguage) || languages[0]
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-muted transition-colors touch-manipulation">
        <Globe className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{currentLang.nativeName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`cursor-pointer touch-manipulation ${currentLanguage === lang.code ? 'bg-accent text-accent-foreground' : ''}`}
          >
            <span className="font-medium">{lang.nativeName}</span>
            <span className="text-muted-foreground text-xs ml-2">({lang.name})</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

