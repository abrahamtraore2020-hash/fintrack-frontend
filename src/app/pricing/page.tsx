'use client'
import { useState } from 'react'
import { Check, X, Crown } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { PLANS } from '@/lib/constants'
import { Currency, BillingPeriod } from '@/types'
import { cn } from '@/lib/utils'

const CURRENCY_SYMBOLS: Record<Currency, string> = { XOF: 'FCFA', USD: '$', EUR: '€' }

export default function PricingPage() {
  const [period, setPeriod] = useState<BillingPeriod>('monthly')
  const [currency, setCurrency] = useState<Currency>('XOF')

  const formatPrice = (plan: typeof PLANS[0]) => {
    const price = plan.prices[period][currency]
    if (price === null) return 'Sur devis'
    const sym = CURRENCY_SYMBOLS[currency]
    const perLabel = { monthly: '/ mois', yearly: '/ an', lifetime: 'à vie' }[period]
    return currency === 'XOF' ? `${price.toLocaleString('fr-FR')} ${sym}` : `${sym}${price}`
  }

  return (
    <AppLayout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Choisissez votre <span className="text-glow-blue">Plan</span></h1>
        <p className="text-sm text-gray-500">14 jours d'essai gratuit sur tous les plans — Aucune carte bancaire requise</p>
      </div>

      {/* Toggle période */}
      <div className="flex justify-center mb-4">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {(['monthly','yearly','lifetime'] as BillingPeriod[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn('px-4 py-2 rounded-lg text-xs font-medium transition-all', period === p ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500')}>
              {p === 'monthly' ? 'Mensuel' : p === 'yearly' ? <span>Annuel <span className="text-green-600">-17%</span></span> : 'À vie'}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle devise */}
      <div className="flex justify-center gap-2 mb-8">
        {(['XOF','USD','EUR'] as Currency[]).map(c => (
          <button key={c} onClick={() => setCurrency(c)}
            className={cn('px-3 py-1 rounded-full text-xs font-medium transition-all border', currency === c ? 'bg-gold border-gold text-[#1A1A2E]' : 'border-gray-200 text-gray-500 hover:border-gold')}>
            {CURRENCY_SYMBOLS[c]}
          </button>
        ))}
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {PLANS.map(plan => (
          <div key={plan.id} className={cn('relative bg-white dark:bg-dark-card rounded-2xl p-5 border transition-transform hover:-translate-y-1', plan.highlighted ? 'border-gold shadow-gold' : 'border-gray-100 shadow-card')}>
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-[#1A1A2E] text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                ⭐ Plus populaire
              </div>
            )}
            <div className="mb-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Plan {plan.id}</p>
              <h2 className={cn('text-lg font-bold mb-0.5', plan.highlighted && 'text-glow-blue')}>{plan.name}</h2>
              <p className="text-xs text-gray-500">{plan.description}</p>
            </div>
            <div className="mb-5">
              <span className={cn('text-2xl font-bold', plan.highlighted ? 'text-glow-blue' : 'text-gray-800')}>
                {formatPrice(plan)}
              </span>
              {plan.prices[period][currency] !== null && (
                <span className="text-xs text-gray-400 ml-1">
                  {period === 'monthly' ? '/ mois' : period === 'yearly' ? '/ an' : 'à vie'}
                </span>
              )}
            </div>
            <ul className="space-y-2 mb-5 text-xs">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600">
                  <Check size={13} className="text-green-500 mt-0.5 flex-shrink-0" />{f}
                </li>
              ))}
              {plan.missingFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300">
                  <X size={13} className="mt-0.5 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Button variant={plan.highlighted ? 'primary' : plan.id === 'enterprise' ? 'outline' : plan.id === 'business' ? 'dark' : 'outline'} className="w-full">
              {plan.id === 'enterprise' ? 'Nous contacter' : 'Commencer l\'essai gratuit'}
            </Button>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-gray-400 mt-6">
        💳 Paiement sécurisé via <strong>CinetPay</strong> · Wave · Orange Money · Carte bancaire (Visa/Mastercard)
      </p>
    </AppLayout>
  )
}
