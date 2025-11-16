'use client'

import { useState, useEffect } from 'react'
import { Download, ChevronDown, ChevronUp } from 'lucide-react'
import { Language, getLanguageByCode } from '@/lib/i18n/types'
import { downloadTranslations } from '@/lib/i18n/translations'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

const DOWNLOAD_LINKS = {
  '64bit': 'https://www.dropbox.com/scl/fi/gpxrcfwe80tcxjj4iyxxy/ilmiyya-64-bit.zip?rlkey=ovqo29rr6xp4jhwh9lo7nrle8&st=qynkdoci&dl=1',
  '32bit': 'https://www.dropbox.com/scl/fi/hqp5x747tc61ke04w8x7b/ilmiyya-32-bit.zip?rlkey=lu071cuvuk0dxluoy6oc2oxq8&st=9fmj8qf3&dl=1',
}

type SystemArchitecture = '64bit' | '32bit' | null

function detectSystemArchitecture(): SystemArchitecture {
  if (typeof window === 'undefined') return null
  
  // Check for 64-bit architecture
  const userAgent = navigator.userAgent.toLowerCase()
  const platform = navigator.platform?.toLowerCase() || ''
  
  // Check for explicit 64-bit indicators
  if (userAgent.includes('win64') || userAgent.includes('x64') || 
      userAgent.includes('amd64') || platform.includes('win64')) {
    return '64bit'
  }
  
  // Check for 32-bit indicators
  if (userAgent.includes('win32') || userAgent.includes('x86') || 
      platform.includes('win32')) {
    return '32bit'
  }
  
  // If unsure, default to null to show all options
  return null
}

export default function DownloadPage() {
  const [language, setLanguage] = useState<Language>('en')
  const [detectedArch, setDetectedArch] = useState<SystemArchitecture>(null)
  const [showAllDownloads, setShowAllDownloads] = useState(false)
  
  const t = downloadTranslations[language]
  const langConfig = getLanguageByCode(language)
  
  useEffect(() => {
    const arch = detectSystemArchitecture()
    setDetectedArch(arch)
    // If we can't detect, show all options by default
    if (arch === null) {
      setShowAllDownloads(true)
    }
  }, [])
  
  const handleDownload = (arch: '64bit' | '32bit') => {
    window.location.href = DOWNLOAD_LINKS[arch]
  }
  
  const recommendedDownload = detectedArch || '64bit'
  
  return (
    <div 
      className="container mx-auto px-4 py-6 md:py-12 max-w-4xl"
      dir={langConfig.dir}
    >
      <div className="space-y-6 md:space-y-8 animate-entrance">
        {/* Header with Language Switcher */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 ${langConfig.dir === 'rtl' ? 'font-arabic' : ''}`}>
              {t.title}
            </h1>
            <p className={`text-base md:text-lg text-muted-foreground ${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''}`}>
              {t.description}
            </p>
          </div>
          <div className="self-start sm:self-auto">
            <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
          </div>
        </div>
        
        {/* Main Download Section */}
        <div className="card p-4 sm:p-6 md:p-8 space-y-4 md:space-y-6">
          {detectedArch && !showAllDownloads ? (
            <>
              {/* Recommended Download */}
              <div>
                <h2 className={`text-lg md:text-xl font-semibold mb-3 md:mb-4 ${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''}`}>
                  {t.recommendedTitle}
                </h2>
                <button
                  onClick={() => handleDownload(recommendedDownload)}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all flex items-center justify-center gap-2 sm:gap-3 hover:scale-105 active:scale-95"
                >
                  <Download className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <span className={`${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''} text-center`}>
                    {t.downloadButton}
                  </span>
                </button>
                <p className={`text-xs sm:text-sm text-muted-foreground mt-2 text-center ${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''}`}>
                  {detectedArch === '64bit' ? t.windows64Description : t.windows32Description}
                </p>
              </div>
              
              {/* Show All Downloads Button */}
              <button
                onClick={() => setShowAllDownloads(true)}
                className={`w-full text-accent hover:text-accent/80 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''}`}
              >
                <span>{t.showAllDownloads}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {/* Detection Message */}
              {detectedArch === null && (
                <div className="bg-muted/50 p-4 rounded-lg border border-border">
                  <p className={`text-sm text-muted-foreground ${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''}`}>
                    {t.detectionMessage}
                  </p>
                </div>
              )}
              
              {/* All Download Options */}
              <div className="space-y-3 md:space-y-4">
                {/* 64-bit Download */}
                <div className="border border-border rounded-lg p-4 sm:p-6 hover:border-accent transition-colors">
                  <div className="flex flex-col gap-3">
                    <div className="flex-1">
                      <h3 className={`text-base sm:text-lg font-semibold mb-1.5 sm:mb-2 ${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''}`}>
                        {t.windows64Title}
                      </h3>
                      <p className={`text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 ${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''}`}>
                        {t.windows64Description}
                      </p>
                      <button
                        onClick={() => handleDownload('64bit')}
                        className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-all flex items-center justify-center sm:justify-start gap-2 active:scale-95"
                      >
                        <Download className="w-4 h-4 flex-shrink-0" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* 32-bit Download */}
                <div className="border border-border rounded-lg p-4 sm:p-6 hover:border-accent transition-colors">
                  <div className="flex flex-col gap-3">
                    <div className="flex-1">
                      <h3 className={`text-base sm:text-lg font-semibold mb-1.5 sm:mb-2 ${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''}`}>
                        {t.windows32Title}
                      </h3>
                      <p className={`text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 ${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''}`}>
                        {t.windows32Description}
                      </p>
                      <button
                        onClick={() => handleDownload('32bit')}
                        className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-all flex items-center justify-center sm:justify-start gap-2 active:scale-95"
                      >
                        <Download className="w-4 h-4 flex-shrink-0" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Show Recommended Only Button (if we had detected) */}
              {detectedArch && (
                <button
                  onClick={() => setShowAllDownloads(false)}
                  className={`w-full text-accent hover:text-accent/80 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''}`}
                >
                  <span>{t.showRecommendedOnly}</span>
                  <ChevronUp className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
        
        {/* System Requirements */}
        <div className="card p-4 sm:p-6">
          <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''}`}>
            {t.systemRequirementsTitle}
          </h3>
          <ul className={`space-y-2 text-sm sm:text-base ${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''}`}>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1 flex-shrink-0">•</span>
              <span>{t.requirement1}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1 flex-shrink-0">•</span>
              <span>{t.requirement2}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1 flex-shrink-0">•</span>
              <span>{t.requirement3}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

