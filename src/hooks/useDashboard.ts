'use client'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { DashboardData } from '@/types'

export function useDashboard() {
  const { user } = useAppStore()

  return useQuery<DashboardData>({
    queryKey: ['dashboard', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [txRes, coffresRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user!.id).gte('date', startOfMonth).order('date', { ascending: false }),
        supabase.from('coffres').select('*').eq('user_id', user!.id),
      ])

      const transactions = txRes.data || []
      const monthlyIncome = transactions.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0)
      const monthlyExpenses = transactions.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0)
      const totalCoffres = (coffresRes.data || []).reduce((s: number, c: any) => s + c.current_amount, 0)

      return {
        monthlyIncome, monthlyExpenses,
        netBalance: monthlyIncome - monthlyExpenses,
        totalCoffres,
        monthlyStats: [], categoryBreakdown: [],
        recentTransactions: transactions.slice(0, 5),
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}
