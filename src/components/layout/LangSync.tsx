'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

export function LangSync() {
  const lang = useAppStore(s => s.lang)
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' || lang === 'fa' || lang === 'he' || lang === 'ur' ? 'rtl' : 'ltr'
  }, [lang])
  return null
}
