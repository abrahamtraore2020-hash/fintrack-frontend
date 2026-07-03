export type Currency =
  // Afrique
  | 'XOF' | 'XAF' | 'GHS' | 'NGN' | 'KES' | 'ZAR' | 'EGP' | 'MAD' | 'TND' | 'DZD'
  | 'ETB' | 'TZS' | 'UGX' | 'RWF' | 'MZN' | 'ZMW' | 'BWP' | 'MUR' | 'SCR' | 'CVE'
  | 'GMD' | 'SLL' | 'GNF' | 'BIF' | 'CDF' | 'AOA' | 'NAD' | 'SZL' | 'LSL' | 'MWK'
  | 'ZWL' | 'SDG' | 'SSP' | 'LYD' | 'DJF' | 'ERN' | 'SOS' | 'KMF' | 'MGA' | 'STN'
  // Amériques
  | 'USD' | 'CAD' | 'MXN' | 'BRL' | 'ARS' | 'COP' | 'CLP' | 'PEN' | 'VES' | 'BOB'
  | 'PYG' | 'UYU' | 'GTQ' | 'HNL' | 'NIO' | 'CRC' | 'PAB' | 'DOP' | 'CUP' | 'HTG'
  | 'JMD' | 'TTD' | 'BBD' | 'GYD' | 'SRD' | 'BZD' | 'XCD'
  // Europe
  | 'EUR' | 'GBP' | 'CHF' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'RON'
  | 'TRY' | 'RUB' | 'UAH' | 'BGN' | 'HRK' | 'RSD' | 'ISK' | 'MKD' | 'ALL' | 'BAM'
  | 'MDL' | 'GEL' | 'AMD' | 'AZN' | 'BYN' | 'KZT' | 'GBP'
  // Asie
  | 'CNY' | 'JPY' | 'KRW' | 'INR' | 'IDR' | 'SGD' | 'HKD' | 'TWD' | 'THB' | 'MYR'
  | 'PHP' | 'VND' | 'PKR' | 'BDT' | 'LKR' | 'NPR' | 'MMK' | 'KHR' | 'LAK' | 'MNT'
  | 'KGS' | 'TJS' | 'UZS' | 'TMT' | 'AFN' | 'MVR' | 'BTN'
  // Moyen-Orient
  | 'AED' | 'SAR' | 'QAR' | 'KWD' | 'BHD' | 'OMR' | 'JOD' | 'IQD' | 'IRR' | 'ILS' | 'LBP' | 'SYP' | 'YER'
  // Océanie
  | 'AUD' | 'NZD' | 'FJD' | 'PGK' | 'SBD' | 'VUV' | 'WST' | 'TOP'
export type BillingPeriod = 'monthly' | 'yearly' | 'lifetime'
export type UserProfile = 'personal' | 'freelance' | 'business' | 'enterprise'
export type Lang =
  | 'fr' | 'en' | 'ar' | 'es' | 'pt' | 'de' | 'it' | 'nl' | 'ru' | 'zh' | 'ja' | 'ko'
  | 'hi' | 'tr' | 'pl' | 'uk' | 'ro' | 'hu' | 'cs' | 'sv' | 'no' | 'da' | 'fi' | 'el'
  | 'he' | 'fa' | 'ur' | 'bn' | 'vi' | 'th' | 'id' | 'ms' | 'tl' | 'sw' | 'ha' | 'yo'
  | 'ig' | 'am' | 'so' | 'mg' | 'wo' | 'bm' | 'ff' | 'ln' | 'lg' | 'rw' | 'ny' | 'sn'
  | 'xh' | 'zu' | 'st' | 'tn' | 'ss' | 'ts' | 've' | 'nr' | 'nd'
export type PlanName = 'starter' | 'pro' | 'business' | 'enterprise'
export type TransactionType = 'income' | 'expense' | 'transfer'
export type TransactionCategory = 'food'|'transport'|'housing'|'health'|'entertainment'|'salary'|'freelance'|'investment'|'shopping'|'utilities'|'education'|'other'
export type AccountType = 'mobile_money' | 'bank' | 'platform' | 'custom'
export type AccountProvider = 'wave'|'orange_money'|'mtn_money'|'moov_money'|'stripe'|'paypal'|'bank_classic'|'custom'
export type CoffreMode = 'manual' | 'auto' | 'hybrid'
export type CoffreStatus = 'active' | 'paused' | 'completed'
export type ObjectifStatus = 'on_track' | 'at_risk' | 'completed' | 'overdue'
export type AlarmType = 'expense_threshold'|'balance_low'|'periodic_reminder'|'coffre_milestone'|'deadline'|'income_received'
export type NotifChannel = 'email' | 'push_mobile' | 'web_push' | 'in_app'
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded'
export type PaymentProvider = 'cinetpay' | 'stripe'

export interface User {
  id: string; email: string; firstName: string; lastName: string
  avatar?: string; profile: UserProfile; plan: PlanName
  trialEndsAt?: string; currency: Currency; lang: Lang; createdAt: string
}
export interface Transaction {
  id: string; userId: string; type: TransactionType; amount: number
  currency: Currency; category: TransactionCategory; description: string
  date: string; accountId: string; coffreId?: string
  isRecurring: boolean; createdAt: string
}
export interface Account {
  id: string; userId: string; type: AccountType; provider: AccountProvider
  name: string; balance: number; currency: Currency; isConnected: boolean
  lastSync?: string; apiKey?: string; webhookUrl?: string; createdAt: string
}
export interface CoffreRule { type: 'percentage'|'fixed'; value: number; trigger: 'each_income'|'monthly'|'weekly' }
export interface Coffre {
  id: string; userId: string; name: string; icon: string; color: string
  targetAmount: number; currentAmount: number; currency: Currency
  mode: CoffreMode; status: CoffreStatus; rule?: CoffreRule
  deadline?: string; createdAt: string
}
export interface Objectif {
  id: string; userId: string; coffreId: string; name: string
  targetAmount: number; currentAmount: number; currency: Currency
  deadline: string; status: ObjectifStatus; progressPercent: number
  estimatedCompletion?: string; aiAdvice?: string; createdAt: string
}
export interface Alarm {
  id: string; userId: string; type: AlarmType; name: string; description: string
  condition: Record<string, unknown>; channels: NotifChannel[]
  isActive: boolean; schedule?: string; createdAt: string
}
export interface Notification {
  id: string; userId: string; alarmId?: string; title: string; body: string
  type: AlarmType; isRead: boolean; createdAt: string
}
export interface MonthlyStats { month: string; income: number; expenses: number; savings: number; net: number }
export interface CategoryBreakdown { category: TransactionCategory; amount: number; percentage: number; count: number }
export interface DashboardData {
  monthlyIncome: number; monthlyExpenses: number; netBalance: number; totalCoffres: number
  monthlyStats: MonthlyStats[]; categoryBreakdown: CategoryBreakdown[]
  recentTransactions: Transaction[]; aiAdvice?: string
}
export interface Subscription {
  id: string; userId: string; plan: PlanName; billingPeriod: BillingPeriod
  currency: Currency; amount: number; status: PaymentStatus; provider: PaymentProvider
  currentPeriodStart: string; currentPeriodEnd: string; cancelAtPeriodEnd: boolean; createdAt: string
}
export interface MonthlyPlan {
  id: string; userId: string; month: number; year: number
  incomeGoal: number; notes?: string; createdAt: string
}
export interface PlanBudgetLine {
  id: string; planId: string; userId: string; category: string; amount: number; createdAt: string
}
export interface PlanTodo {
  id: string; planId: string; userId: string; title: string
  amount?: number; isDone: boolean; createdAt: string
}

export interface ApiResponse<T> { success: boolean; data: T; message?: string; error?: string }
export interface PaginatedResponse<T> { data: T[]; total: number; page: number; limit: number; hasMore: boolean }
export interface Plan {
  id: PlanName; name: string; description: string; color: string; highlighted: boolean
  prices: { monthly: Partial<Record<Currency,number|null>>; yearly: Partial<Record<Currency,number|null>>; lifetime: Partial<Record<Currency,number|null>> }
  limits: { accounts: number|'unlimited'; integrations: number|'unlimited'; transactions: number|'unlimited'; coffres: number|'unlimited'; alarms: number|'unlimited'; users: number|'unlimited' }
  features: string[]; missingFeatures: string[]
}
