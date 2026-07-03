'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, ensureSession } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { MonthlyPlan, PlanBudgetLine, PlanTodo } from '@/types'
import toast from 'react-hot-toast'

function mapPlan(row: Record<string, unknown>): MonthlyPlan {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    month: row.month as number,
    year: row.year as number,
    incomeGoal: (row.income_goal as number) || 0,
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
  }
}

function mapBudgetLine(row: Record<string, unknown>): PlanBudgetLine {
  return {
    id: row.id as string,
    planId: row.plan_id as string,
    userId: row.user_id as string,
    category: row.category as string,
    amount: (row.amount as number) || 0,
    createdAt: row.created_at as string,
  }
}

function mapTodo(row: Record<string, unknown>): PlanTodo {
  return {
    id: row.id as string,
    planId: row.plan_id as string,
    userId: row.user_id as string,
    title: row.title as string,
    amount: row.amount as number | undefined,
    isDone: (row.is_done as boolean) || false,
    createdAt: row.created_at as string,
  }
}

// ─── Monthly Plan ─────────────────────────────────────────────────────────────
export function useMonthlyPlan(month: number, year: number) {
  const { user } = useAppStore()
  const qc = useQueryClient()

  const query = useQuery<MonthlyPlan | null>({
    queryKey: ['monthly_plan', user?.id, month, year],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monthly_plans')
        .select('*')
        .eq('user_id', user!.id)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle()
      if (error) throw error
      return data ? mapPlan(data as Record<string, unknown>) : null
    },
  })

  // Ensure plan exists (create if needed), returns planId
  const ensurePlan = async (incomeGoal = 0): Promise<string> => {
    const uid = await ensureSession()
    const { data: existing } = await supabase
      .from('monthly_plans')
      .select('id')
      .eq('user_id', uid)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle()
    if (existing) return (existing as Record<string, unknown>).id as string
    const { data: created, error } = await supabase
      .from('monthly_plans')
      .insert({ user_id: uid, month, year, income_goal: incomeGoal })
      .select('id')
      .single()
    if (error) throw error
    qc.invalidateQueries({ queryKey: ['monthly_plan', uid, month, year] })
    return (created as Record<string, unknown>).id as string
  }

  const savePlan = useMutation({
    mutationFn: async ({
      incomeGoal,
      budgets,
    }: {
      incomeGoal: number
      budgets: Record<string, number>
    }) => {
      const uid = await ensureSession()
      const planId = await ensurePlan(incomeGoal)

      // Update income goal
      await supabase
        .from('monthly_plans')
        .update({ income_goal: incomeGoal })
        .eq('id', planId)

      // Upsert non-zero budget lines
      const lines = Object.entries(budgets)
        .filter(([, amount]) => amount > 0)
        .map(([category, amount]) => ({
          plan_id: planId,
          user_id: uid,
          category,
          amount,
        }))
      if (lines.length > 0) {
        const { error } = await supabase
          .from('plan_budget_lines')
          .upsert(lines, { onConflict: 'plan_id,category' })
        if (error) throw error
      }

      // Remove zero lines
      const zeroCats = Object.entries(budgets)
        .filter(([, amount]) => amount === 0)
        .map(([cat]) => cat)
      if (zeroCats.length > 0) {
        await supabase
          .from('plan_budget_lines')
          .delete()
          .eq('plan_id', planId)
          .in('category', zeroCats)
      }

      qc.invalidateQueries({ queryKey: ['monthly_plan'] })
      qc.invalidateQueries({ queryKey: ['plan_budget_lines', planId] })
      return planId
    },
    onSuccess: () => toast.success('Plan enregistré !'),
    onError: (e: any) => toast.error(e.message || 'Erreur'),
  })

  return { ...query, savePlan, ensurePlan }
}

// ─── Budget Lines ─────────────────────────────────────────────────────────────
export function usePlanBudgetLines(planId: string | null | undefined) {
  return useQuery<PlanBudgetLine[]>({
    queryKey: ['plan_budget_lines', planId],
    enabled: !!planId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plan_budget_lines')
        .select('*')
        .eq('plan_id', planId!)
      if (error) throw error
      return (data || []).map((r) => mapBudgetLine(r as Record<string, unknown>))
    },
  })
}

// ─── Todos ────────────────────────────────────────────────────────────────────
export function usePlanTodos(planId: string | null | undefined) {
  const qc = useQueryClient()

  const query = useQuery<PlanTodo[]>({
    queryKey: ['plan_todos', planId],
    enabled: !!planId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plan_todos')
        .select('*')
        .eq('plan_id', planId!)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data || []).map((r) => mapTodo(r as Record<string, unknown>))
    },
  })

  const create = useMutation({
    mutationFn: async (input: { title: string; amount?: number }) => {
      const uid = await ensureSession()
      if (!planId) throw new Error('Plan non initialisé')
      const { error } = await supabase.from('plan_todos').insert({
        plan_id: planId,
        user_id: uid,
        title: input.title.trim(),
        amount: input.amount || null,
        is_done: false,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plan_todos', planId] }),
    onError: (e: any) => toast.error(e.message || 'Erreur'),
  })

  const toggle = useMutation({
    mutationFn: async ({ id, isDone }: { id: string; isDone: boolean }) => {
      const { error } = await supabase
        .from('plan_todos')
        .update({ is_done: isDone })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plan_todos', planId] }),
    onError: (e: any) => toast.error(e.message || 'Erreur'),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('plan_todos').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plan_todos', planId] })
      toast.success('Tâche supprimée')
    },
    onError: (e: any) => toast.error(e.message || 'Erreur'),
  })

  return { ...query, create, toggle, remove }
}
