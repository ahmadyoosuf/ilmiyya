'use client'

import { ReactNode } from 'react'
import { useVisitorTracking } from '@/hooks/use-visitor-tracking'

export function RootLayoutClient({ children }: { children: ReactNode }) {
  useVisitorTracking()

  return <>{children}</>
}
