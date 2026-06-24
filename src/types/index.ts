export type Currency = 'XOF' | 'USD' | 'EUR'
export type BillingPeriod = 'monthly' | 'yearly' | 'lifetime'
export type UserProfile = 'personal' | 'freelance' | 'business' | 'enterprise'
export type Lang = 'fr' | 'en'
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
export interface ApiResponse<T> { success: boolean; data: T; message?: string; error?: string }
export interface PaginatedResponse<T> { data: T[]; total: number; page: number; limit: number; hasMore: boolean }
export interface Plan {
  id: PlanName; name: string; description: string; color: string; highlighted: boolean
  prices: { monthly: Record<Currency,number|null>; yearly: Record<Currency,number|null>; lifetime: Record<Currency,number|null> }
  limits: { accounts: number|'unlimited'; integrations: number|'unlimited'; transactions: number|'unlimited'; coffres: number|'unlimited'; alarms: number|'unlimited'; users: number|'unlimited' }
  features: string[]; missingFeatures: string[]
}
