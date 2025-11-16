// Isolated i18n types for Download and Donate pages only
export type Language = 'en' | 'ar' | 'ta'

export interface LanguageOption {
  code: Language
  name: string
  nativeName: string
  dir: 'ltr' | 'rtl'
}

export const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' },
]

export const getLanguageByCode = (code: string): LanguageOption => {
  return languages.find(lang => lang.code === code) || languages[0]
}



