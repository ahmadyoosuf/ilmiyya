'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Language, getLanguageByCode } from '@/lib/i18n/types'
import { uiTranslations } from '@/lib/i18n/ui-translations'

const STORAGE_KEY = 'ilmiyya-language'

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (typeof uiTranslations)[Language]
  dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function isLanguage(value: string | null): value is Language {
  return value === 'ar' || value === 'en' || value === 'ta'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLanguage(saved)) {
      setLanguageState(saved)
    }
    setMounted(true)
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
  }, [])

  const dir = getLanguageByCode(language).dir

  useEffect(() => {
    if (!mounted) return
    document.documentElement.lang = language
    document.documentElement.dir = dir
  }, [language, dir, mounted])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: uiTranslations[language],
      dir,
    }),
    [language, setLanguage, dir]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
