'use client'
import { useAppStore } from '@/store/useAppStore'
import { t, TranslationKey } from '@/lib/translations'

export function useT() {
  const lang = useAppStore(s => s.lang)
  return (key: TranslationKey) => t(key, lang)
}
