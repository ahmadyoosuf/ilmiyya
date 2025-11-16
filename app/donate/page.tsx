'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Download, Heart } from 'lucide-react'
import { Language, getLanguageByCode } from '@/lib/i18n/types'
import { donateTranslations } from '@/lib/i18n/translations'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

const UPI_ID = 'thamim1982@oksbi'
const UPI_LINK = `upi://pay?pa=${UPI_ID}&cu=INR`
const QR_CODE_PATH = '/qr-code.png'

export default function DonatePage() {
  const [language, setLanguage] = useState<Language>('en')
  const [showThankYou, setShowThankYou] = useState(false)
  
  const t = donateTranslations[language]
  const langConfig = getLanguageByCode(language)
  
  const handleUPIClick = () => {
    setShowThankYou(true)
    setTimeout(() => setShowThankYou(false), 5000)
    
    // Open UPI link
    window.location.href = UPI_LINK
  }
  
  const handleDownloadQR = () => {
    const link = document.createElement('a')
    link.href = QR_CODE_PATH
    link.download = 'ilmiyya-donation-qr.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  return (
    <div 
      className="container mx-auto px-4 py-6 md:py-12 max-w-4xl"
      dir={langConfig.dir}
    >
      <div className="space-y-6 md:space-y-8 animate-entrance">
        {/* Header with Language Switcher */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 md:mb-4">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-accent flex-shrink-0" />
              <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold ${langConfig.dir === 'rtl' ? 'font-arabic' : ''}`}>
                {t.title}
              </h1>
            </div>
            <p className={`text-base md:text-lg text-muted-foreground ${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''}`}>
              {t.description}
            </p>
          </div>
          <div className="self-start sm:self-auto">
            <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
          </div>
        </div>
        
        {/* Thank You Message */}
        {showThankYou && (
          <div className="card p-4 sm:p-6 bg-accent/10 border-accent animate-bounce-in">
            <p className={`text-center text-base sm:text-lg font-semibold text-accent ${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''}`}>
              {t.thankYouMessage}
            </p>
          </div>
        )}
        
        {/* Main Donation Section */}
        <div className="card p-4 sm:p-6 md:p-8 space-y-5 md:space-y-6">
          <h2 className={`text-xl sm:text-2xl font-semibold text-center mb-4 md:mb-6 ${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''}`}>
            {t.donateViaUPI}
          </h2>
          
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-white p-3 sm:p-4 rounded-2xl shadow-lg border-2 border-border">
              <Image
                src={QR_CODE_PATH}
                alt="UPI Payment QR Code"
                width={256}
                height={256}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </div>
          
          {/* Instructions */}
          <p className={`text-center text-sm sm:text-base text-muted-foreground px-2 ${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''}`}>
            {t.scanToContribute}
          </p>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Pay with UPI Button */}
            <button
              onClick={handleUPIClick}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all flex items-center justify-center gap-2 sm:gap-3 hover:scale-105 active:scale-95"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className={`${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''} text-center`}>
                {t.payUsingUPI}
              </span>
            </button>
            
            {/* Download QR Code Button */}
            <button
              onClick={handleDownloadQR}
              className="w-full border-2 border-border hover:border-accent text-foreground hover:text-accent px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className={`${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''} text-sm sm:text-base`}>
                {t.downloadQRCode}
              </span>
            </button>
          </div>
          
          {/* UPI ID Display */}
          <div className="bg-muted/50 p-3 sm:p-4 rounded-lg border border-border text-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">UPI ID</p>
            <p className="font-mono text-base sm:text-lg font-semibold break-all">{UPI_ID}</p>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="text-center">
          <p className={`text-sm text-muted-foreground ${langConfig.dir === 'rtl' ? 'font-arabic-sans' : ''}`}>
            {t.thankYouMessage}
          </p>
        </div>
      </div>
    </div>
  )
}

