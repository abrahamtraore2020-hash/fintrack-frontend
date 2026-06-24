import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Currency } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formater les montants selon la devise
export function formatAmount(amount: number, currency: Currency): string {
  const formatters: Record<Currency, Intl.NumberFormat> = {
    XOF: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }),
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    EUR: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }),
  }
  return formatters[currency].format(amount)
}

// Symbole de la devise
export function getCurrencySymbol(currency: Currency): string {
  return { XOF: 'FCFA', USD: '$', EUR: '€' }[currency]
}

// Calcul progression coffre
export function calcProgress(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}

// Estimation date atteinte objectif
export function estimateCompletion(
  current: number, target: number,
  monthlyContrib: number, deadline?: string
): { months: number; date: string; isOnTrack: boolean } {
  const remaining = target - current
  if (monthlyContrib <= 0) return { months: 999, date: 'Indéfini', isOnTrack: false }
  const months = Math.ceil(remaining / monthlyContrib)
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  const isOnTrack = deadline ? new Date(deadline) >= date : true
  return { months, date: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }), isOnTrack }
}

// Tronquer un texte
export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}

// Relative time (il y a X minutes...)
export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `Il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Il y a ${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `Il y a ${days}j`
  return new Date(date).toLocaleDateString('fr-FR')
}

// Couleur de catégorie
export const CATEGORY_COLORS: Record<string, string> = {
  food: '#F59E0B', transport: '#3B82F6', housing: '#8B5CF6',
  health: '#EF4444', entertainment: '#EC4899', salary: '#22C55E',
  freelance: '#10B981', investment: '#FFD700', shopping: '#F97316',
  utilities: '#6B7280', education: '#14B8A6', other: '#9CA3AF'
}

export const CATEGORY_LABELS_FR: Record<string, string> = {
  food: 'Alimentation', transport: 'Transport', housing: 'Logement',
  health: 'Santé', entertainment: 'Loisirs', salary: 'Salaire',
  freelance: 'Freelance', investment: 'Investissement', shopping: 'Shopping',
  utilities: 'Factures', education: 'Éducation', other: 'Autre'
}
