'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, ensureSession } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { MonthlyPlan, PlanBudgetLine, PlanTodo, PlanWeeklyGoal, PlanRoutineTask } from '@/types'
import toast from 'react-hot-toast'

const DEFAULT_ROUTINE = ['Analyse business', 'Lecture', 'Formation', 'Film / détente']

function mapPlan(r: Record<string, unknown>): MonthlyPlan {
  return { id: r.id as string, userId: r.user_id as string, month: r.month as number, year: r.year as number, incomeGoal: (r.income_goal as number) || 0, notes: r.notes as string | undefined, createdAt: r.created_at as string }
}
function mapBudgetLine(r: Record<string, unknown>): PlanBudgetLine {
  return { id: r.id as string, planId: r.plan_id as string, userId: r.user_id as string, category: r.category as string, amount: (r.amount as number) || 0, createdAt: r.created_at as string }
}
function mapTodo(r: Record<string, unknown>): PlanTodo {
  return { id: r.id as string, planId: r.plan_id as string, userId: r.user_id as string, title: r.title as string, amount: r.amount as number | undefined, dateLabel: r.date_label as string | undefined, isDone: (r.is_done as boolean) || false, createdAt: r.created_at as string }
}
function mapWeeklyGoal(r: Record<string, unknown>): PlanWeeklyGoal {
  return { id: r.id as string, planId: r.plan_id as string, userId: r.user_id as string, weekNumber: r.week_number as number, targetAmount: (r.target_amount as number) || 0, realizedAmount: r.realized_amount as number | undefined, isAchieved: (r.is_achieved as boolean) || false }
}
function mapRoutineTask(r: Record<string, unknown>): PlanRoutineTask {
  return { id: r.id as string, planId: r.plan_id as string, userId: r.user_id as string, label: r.label as string, position: r.position as number, createdAt: r.created_at as string }
}

// ─── Monthly Plan ─────────────────────────────────────────────────────────────
export function useMonthlyPlan(month: number, year: number) {
  const { user } = useAppStore()
  const qc = useQueryClient()

  const query = useQuery<MonthlyPlan | null>({
    queryKey: ['monthly_plan', user?.id, month, year],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from('monthly_plans').select('*').eq('user_id', user!.id).eq('month', month).eq('year', year).maybeSingle()
      if (error) throw error
      return data ? mapPlan(data as Record<string, unknown>) : null
    },
  })

  const ensurePlan = async (incomeGoal = 0): Promise<string> => {
    const uid = await ensureSession()
    const { data: existing } = await supabase.from('monthly_plans').select('id').eq('user_id', uid).eq('month', month).eq('year', year).maybeSingle()
    if (existing) return (existing as Record<string, unknown>).id as string

    const { data: created, error } = await supabase.from('monthly_plans').insert({ user_id: uid, month, year, income_goal: incomeGoal }).select('id').single()
    if (error) throw error
    const planId = (created as Record<string, unknown>).id as string

    // Seed default routine tasks
    await supabase.from('plan_routine_tasks').insert(
      DEFAULT_ROUTINE.map((label, i) => ({ plan_id: planId, user_id: uid, label, position: i }))
    )

    qc.invalidateQueries({ queryKey: ['monthly_plan', uid, month, year] })
    return planId
  }

  return { ...query, ensurePlan }
}

// ─── Budget Lines ─────────────────────────────────────────────────────────────
export function usePlanBudgetLines(planId: string | null | undefined) {
  return useQuery<PlanBudgetLine[]>({
    queryKey: ['plan_budget_lines', planId],
    enabled: !!planId,
    queryFn: async () => {
      const { data, error } = await supabase.from('plan_budget_lines').select('*').eq('plan_id', planId!)
      if (error) throw error
      return (data || []).map((r: any) => mapBudgetLine(r as Record<string, unknown>))
    },
  })
}

// ─── Weekly Goals ─────────────────────────────────────────────────────────────
export function usePlanWeeklyGoals(planId: string | null | undefined) {
  const qc = useQueryClient()

  const query = useQuery<PlanWeeklyGoal[]>({
    queryKey: ['plan_weekly_goals', planId],
    enabled: !!planId,
    queryFn: async () => {
      const { data, error } = await supabase.from('plan_weekly_goals').select('*').eq('plan_id', planId!).order('week_number')
      if (error) throw error
      return (data || []).map((r: any) => mapWeeklyGoal(r as Record<string, unknown>))
    },
  })

  const upsertGoal = useMutation({
    mutationFn: async (goal: { weekNumber: number; targetAmount: number; realizedAmount?: number; isAchieved: boolean }) => {
      const uid = await ensureSession()
      if (!planId) throw new Error('Plan non initialisé')
      const { error } = await supabase.from('plan_weekly_goals').upsert({
        plan_id: planId, user_id: uid,
        week_number: goal.weekNumber,
        target_amount: goal.targetAmount,
        realized_amount: goal.realizedAmount ?? null,
        is_achieved: goal.isAchieved,
      }, { onConflict: 'plan_id,week_number' })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plan_weekly_goals', planId] }),
    onError: (e: any) => toast.error(e.message),
  })

  return { ...query, upsertGoal }
}

// ─── Routine Tasks ────────────────────────────────────────────────────────────
export function usePlanRoutineTasks(planId: string | null | undefined) {
  const qc = useQueryClient()

  const query = useQuery<PlanRoutineTask[]>({
    queryKey: ['plan_routine_tasks', planId],
    enabled: !!planId,
    queryFn: async () => {
      const { data, error } = await supabase.from('plan_routine_tasks').select('*').eq('plan_id', planId!).order('position')
      if (error) throw error
      return (data || []).map((r: any) => mapRoutineTask(r as Record<string, unknown>))
    },
  })

  const addTask = useMutation({
    mutationFn: async (label: string) => {
      const uid = await ensureSession()
      if (!planId) throw new Error('Plan non initialisé')
      const { error } = await supabase.from('plan_routine_tasks').insert({ plan_id: planId, user_id: uid, label, position: query.data?.length || 0 })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plan_routine_tasks', planId] }),
    onError: (e: any) => toast.error(e.message),
  })

  const removeTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from('plan_routine_tasks').delete().eq('id', taskId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plan_routine_tasks', planId] })
      qc.invalidateQueries({ queryKey: ['plan_routine_entries', planId] })
    },
    onError: (e: any) => toast.error(e.message),
  })

  return { ...query, addTask, removeTask }
}

// ─── Routine Entries ──────────────────────────────────────────────────────────
export function usePlanRoutineEntries(planId: string | null | undefined) {
  const qc = useQueryClient()

  const query = useQuery<Record<string, boolean>>({
    queryKey: ['plan_routine_entries', planId],
    enabled: !!planId,
    queryFn: async () => {
      const { data, error } = await supabase.from('plan_routine_entries').select('day,task_id,is_done').eq('plan_id', planId!)
      if (error) throw error
      const map: Record<string, boolean> = {}
      ;(data || []).forEach((r: any) => { map[`${r.day}-${r.task_id}`] = r.is_done })
      return map
    },
  })

  const toggle = useMutation({
    mutationFn: async ({ day, taskId, isDone }: { day: number; taskId: string; isDone: boolean }) => {
      const uid = await ensureSession()
      if (!planId) throw new Error('Plan non initialisé')
      const { error } = await supabase.from('plan_routine_entries').upsert(
        { plan_id: planId, user_id: uid, day, task_id: taskId, is_done: isDone },
        { onConflict: 'plan_id,day,task_id' }
      )
      if (error) throw error
    },
    onMutate: async ({ day, taskId, isDone }) => {
      await qc.cancelQueries({ queryKey: ['plan_routine_entries', planId] })
      const prev = qc.getQueryData<Record<string, boolean>>(['plan_routine_entries', planId])
      qc.setQueryData<Record<string, boolean>>(['plan_routine_entries', planId], old => ({ ...old, [`${day}-${taskId}`]: isDone }))
      return { prev }
    },
    onError: (e: any, _: any, ctx: any) => {
      if (ctx?.prev) qc.setQueryData(['plan_routine_entries', planId], ctx.prev)
      toast.error(e.message)
    },
  })

  return { ...query, toggle }
}

// ─── Todos / Tâches occasionnelles ───────────────────────────────────────────
export function usePlanTodos(planId: string | null | undefined) {
  const qc = useQueryClient()

  const query = useQuery<PlanTodo[]>({
    queryKey: ['plan_todos', planId],
    enabled: !!planId,
    queryFn: async () => {
      const { data, error } = await supabase.from('plan_todos').select('*').eq('plan_id', planId!).order('created_at', { ascending: true })
      if (error) throw error
      return (data || []).map((r: any) => mapTodo(r as Record<string, unknown>))
    },
  })

  const create = useMutation({
    mutationFn: async (input: { title: string; dateLabel?: string }) => {
      const uid = await ensureSession()
      if (!planId) throw new Error('Plan non initialisé')
      const { error } = await supabase.from('plan_todos').insert({ plan_id: planId, user_id: uid, title: input.title.trim(), date_label: input.dateLabel || null, is_done: false })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plan_todos', planId] }),
    onError: (e: any) => toast.error(e.message),
  })

  const toggle = useMutation({
    mutationFn: async ({ id, isDone }: { id: string; isDone: boolean }) => {
      const { error } = await supabase.from('plan_todos').update({ is_done: isDone }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plan_todos', planId] }),
    onError: (e: any) => toast.error(e.message),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('plan_todos').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plan_todos', planId] }),
    onError: (e: any) => toast.error(e.message),
  })

  return { ...query, create, toggle, remove }
}
