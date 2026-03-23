import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function useVisitorTracking() {
  const pathName = usePathname()
  const hasTrackedRef = useRef(false)

  useEffect(() => {
    if (hasTrackedRef.current) return
    
    // Don't track admin pages
    if (pathName?.startsWith('/stats')) {
      return
    }

    hasTrackedRef.current = true

    const trackVisitor = async () => {
      try {
        // Get session ID from localStorage or create new one
        let sessionId = typeof window !== 'undefined' ? localStorage.getItem('visitor_session_id') : null
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          if (typeof window !== 'undefined') {
            localStorage.setItem('visitor_session_id', sessionId)
          }
        }

        const trackingData = {
          sessionId,
          page_path: pathName,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }

        // Send to tracking API
        await fetch('/api/track-visitor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trackingData),
        }).catch(() => {
          // Silent fail for tracking errors
        })
      } catch (error) {
        // Silent fail
      }
    }

    // Track after page load to not impact performance
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', trackVisitor, { once: true })
    } else {
      trackVisitor()
    }
  }, [pathName])
}
