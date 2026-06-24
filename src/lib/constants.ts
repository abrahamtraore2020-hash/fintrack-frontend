import { Plan } from '@/types'

export const PLANS: Plan[] = [
  {
    id: 'starter', name: 'Starter', description: 'Particulier', color: '#6B7280', highlighted: false,
    prices: {
      monthly: { XOF: 2500, USD: 4, EUR: 4 },
      yearly:  { XOF: 25000, USD: 40, EUR: 38 },
      lifetime:{ XOF: 75000, USD: 120, EUR: 110 },
    },
    limits: { accounts: 2, integrations: 1, transactions: 100, coffres: 2, alarms: 3, users: 1 },
    features: ['2 comptes connectés','1 intégration','100 transactions/mois','2 coffres (manuel)','Rapports basiques','3 alarmes personnalisées','Notifications Email & Push'],
    missingFeatures: ['Conseil d\'épargne IA','Coffres automatiques','Export PDF','Web Push','Objectifs + projections'],
  },
  {
    id: 'pro', name: 'Pro', description: 'Freelance / Entrepreneur', color: '#3B82F6', highlighted: true,
    prices: {
      monthly: { XOF: 7500, USD: 12, EUR: 11 },
      yearly:  { XOF: 75000, USD: 115, EUR: 105 },
      lifetime:{ XOF: 200000, USD: 320, EUR: 295 },
    },
    limits: { accounts: 10, integrations: 5, transactions: 'unlimited', coffres: 10, alarms: 20, users: 1 },
    features: ['10 comptes connectés','5 intégrations','Transactions illimitées','10 coffres (auto+manuel+hybride)','Conseil d\'épargne IA personnalisé','Objectifs + projections graphiques','20 alarmes personnalisées','Export PDF','Web Push + Email + Push mobile','Résumé hebdo & mensuel'],
    missingFeatures: [],
  },
  {
    id: 'business', name: 'Business', description: 'PME', color: '#1A1A2E', highlighted: false,
    prices: {
      monthly: { XOF: 20000, USD: 32, EUR: 30 },
      yearly:  { XOF: 200000, USD: 320, EUR: 295 },
      lifetime:{ XOF: 500000, USD: 800, EUR: 740 },
    },
    limits: { accounts: 'unlimited', integrations: 'unlimited', transactions: 'unlimited', coffres: 'unlimited', alarms: 'unlimited', users: 10 },
    features: ['Comptes illimités','Intégrations illimitées','Jusqu\'à 10 utilisateurs','Coffres illimités','Conseil épargne avancé (par membre)','Alarmes illimitées','Export PDF + Excel','Support prioritaire','Rapport quotidien par email'],
    missingFeatures: [],
  },
  {
    id: 'enterprise', name: 'Enterprise', description: 'Grande structure', color: '#7C3AED', highlighted: false,
    prices: {
      monthly: { XOF: null, USD: null, EUR: null },
      yearly:  { XOF: null, USD: null, EUR: null },
      lifetime:{ XOF: null, USD: null, EUR: null },
    },
    limits: { accounts: 'unlimited', integrations: 'unlimited', transactions: 'unlimited', coffres: 'unlimited', alarms: 'unlimited', users: 'unlimited' },
    features: ['Tout de Business','Utilisateurs illimités','API personnalisée','White label','Stratégie épargne sur mesure','Consultant dédié','Support 24/7 dédié','Tous formats d\'export'],
    missingFeatures: [],
  },
]

export const TRIAL_DAYS = 14

export const CURRENCY_SYMBOLS = { XOF: 'FCFA', USD: '$', EUR: '€' }

export const ACCOUNT_PROVIDERS = [
  { id: 'wave', name: 'Wave', type: 'mobile_money', icon: '💛', color: '#FFF9D6' },
  { id: 'orange_money', name: 'Orange Money', type: 'mobile_money', icon: '🟠', color: '#FFF3E0' },
  { id: 'mtn_money', name: 'MTN Money', type: 'mobile_money', icon: '💛', color: '#FFFDE7' },
  { id: 'moov_money', name: 'Moov Money', type: 'mobile_money', icon: '🔵', color: '#E3F2FD' },
  { id: 'stripe', name: 'Stripe', type: 'platform', icon: '💳', color: '#EDE9FE' },
  { id: 'paypal', name: 'PayPal', type: 'platform', icon: '🅿️', color: '#E3F2FD' },
  { id: 'bank_classic', name: 'Banque classique', type: 'bank', icon: '🏦', color: '#F3F4F6' },
  { id: 'custom', name: 'Autre plateforme', type: 'custom', icon: '🔗', color: '#F3F4F6' },
]
