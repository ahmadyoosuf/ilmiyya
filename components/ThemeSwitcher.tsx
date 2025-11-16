'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export type Theme = 'sepia' | 'midnight'

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('sepia')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const currentTheme = (savedTheme === 'sepia' || savedTheme === 'midnight') ? savedTheme : 'sepia'
    setTheme(currentTheme)
    document.documentElement.setAttribute('data-theme', currentTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'sepia' ? 'midnight' : 'sepia'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-muted transition-colors"
      aria-label="Toggle theme"
      title={theme === 'sepia' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'sepia' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  )
}

