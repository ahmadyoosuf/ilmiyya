'use client'

import { Language } from '@/lib/i18n/types'
import { useLanguage } from '@/components/LanguageProvider'
import { cn } from '@/lib/utils'

const LANGUAGE_BUTTONS: { code: Language; label: string; title: string }[] = [
  { code: 'ta', label: 'T', title: 'Tamil' },
  { code: 'ar', label: 'A', title: 'Arabic' },
  { code: 'en', label: 'E', title: 'English' },
]

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div
      className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5"
      role="group"
      aria-label="Language"
    >
      {LANGUAGE_BUTTONS.map(({ code, label, title }) => (
        <button
          key={code}
          type="button"
          title={title}
          aria-label={title}
          aria-pressed={language === code}
          onClick={() => setLanguage(code)}
          className={cn(
            'min-w-[2rem] px-2 py-1 text-xs font-semibold rounded-md transition-colors touch-manipulation',
            language === code
              ? 'bg-accent text-accent-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
