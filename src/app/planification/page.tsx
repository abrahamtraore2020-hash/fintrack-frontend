'use client'
import { useState, useEffect, useMemo } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useMonthlyPlan, usePlanBudgetLines, usePlanTodos } from '@/hooks/usePlan'
import { useAppStore } from '@/store/useAppStore'
import { useQueryClient } from '@tanstack/react-query'
import { supabase, ensureSession } from '@/lib/supabase'
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2,
  Check, Loader2, Target, ListTodo, Wallet, TrendingDown,
} from 'lucide-react'
import { formatAmount, CATEGORY_COLORS, CATEGORY_LABELS_FR } from '@/lib/utils'
import toast from 'react-hot-toast'

const PLAN_CATEGORIES = [
  { key: 'food',          emoji: '🍽️' },
  { key: 'transport',     emoji: '🚗' },
  { key: 'housing',       emoji: '🏠' },
  { key: 'health',        emoji: '💊' },
  { key: 'entertainment', emoji: '🎮' },
  { key: 'shopping',      emoji: '🛍️' },
  { key: 'utilities',     emoji: '⚡' },
  { key: 'education',     emoji: '📚' },
  { key: 'investment',    emoji: '💹' },
  { key: 'other',         emoji: '📦' },
]

const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
]

export default function PlanificationPage() {
  const { user } = useAppStore()
  const qc = useQueryClient()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear]   = useState(now.getFullYear())

  // ── data ──────────────────────────────────────────────────────────────────
  const { data: plan, isLoading: planLoading, ensurePlan } = useMonthlyPlan(month, year)
  const { data: budgetLines = [] } = usePlanBudgetLines(plan?.id)
  const { data: todos = [], create: createTodo, toggle: toggleTodo, remove: removeTodo } = usePlanTodos(plan?.id)

  // ── local state ────────────────────────────────────────────────────────────
  const [incomeGoal, setIncomeGoal] = useState('')
  const [budgets, setBudgets]       = useState<Record<string, string>>({})
  const [saving, setSaving]         = useState(false)

  const [showTodoForm, setShowTodoForm]   = useState(false)
  const [newTodo, setNewTodo]             = useState('')
  const [newTodoAmt, setNewTodoAmt]       = useState('')
  const [addingTodo, setAddingTodo]       = useState(false)

  // ── sync plan → local state ───────────────────────────────────────────────
  useEffect(() => {
    setIncomeGoal(plan && plan.incomeGoal > 0 ? String(plan.incomeGoal) : '')
  }, [plan])

  useEffect(() => {
    const map: Record<string, string> = {}
    budgetLines.forEach(l => { map[l.category] = l.amount > 0 ? String(l.amount) : '' })
    setBudgets(map)
  }, [budgetLines])

  // ── computed ───────────────────────────────────────────────────────────────
  const income      = parseFloat(incomeGoal) || 0
  const totalBudget = useMemo(
    () => Object.values(budgets).reduce((s, v) => s + (parseFloat(v) || 0), 0),
    [budgets],
  )
  const remaining  = income - totalBudget
  const doneTodos  = todos.filter(t => t.isDone).length
  const todoAmt    = todos.reduce((s, t) => s + (t.amount || 0), 0)
  const progress   = todos.length > 0 ? Math.round((doneTodos / todos.length) * 100) : 0

  // ── navigation ─────────────────────────────────────────────────────────────
  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }

  // ── save plan ──────────────────────────────────────────────────────────────
  const handleSavePlan = async () => {
    setSaving(true)
    try {
      const uid = await ensureSession()
      const planId = await ensurePlan(income)

      await supabase.from('monthly_plans').update({ income_goal: income }).eq('id', planId)

      const lines = PLAN_CATEGORIES
        .map(c => ({ plan_id: planId, user_id: uid, category: c.key, amount: parseFloat(budgets[c.key] || '0') || 0 }))
        .filter(l => l.amount > 0)

      if (lines.length > 0) {
        const { error } = await supabase.from('plan_budget_lines').upsert(lines, { onConflict: 'plan_id,category' })
        if (error) throw error
      }

      const zeroCats = PLAN_CATEGORIES.filter(c => !budgets[c.key] || parseFloat(budgets[c.key]) === 0).map(c => c.key)
      if (zeroCats.length > 0) {
        await supabase.from('plan_budget_lines').delete().eq('plan_id', planId).in('category', zeroCats)
      }

      qc.invalidateQueries({ queryKey: ['monthly_plan'] })
      qc.invalidateQueries({ queryKey: ['plan_budget_lines', planId] })
      toast.success('Plan enregistré !')
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  // ── add todo ───────────────────────────────────────────────────────────────
  const handleAddTodo = async () => {
    if (!newTodo.trim()) return
    setAddingTodo(true)
    try {
      const planId = await ensurePlan(income)
      qc.invalidateQueries({ queryKey: ['monthly_plan'] })
      await createTodo.mutateAsync({ title: newTodo.trim(), amount: parseFloat(newTodoAmt) || undefined })
      qc.invalidateQueries({ queryKey: ['plan_todos', planId] })
      setNewTodo('')
      setNewTodoAmt('')
      setShowTodoForm(false)
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    } finally {
      setAddingTodo(false)
    }
  }

  const cur = (user?.currency || 'XOF') as any

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <CalendarDays size={22} className="text-gold" />
              Planification mensuelle
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Préparez et suivez votre mois à l'avance</p>
          </div>

          {/* Month selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2 shadow-sm">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-colors">
              <ChevronLeft size={16} className="text-gray-500" />
            </button>
            <span className="font-semibold text-sm text-gray-800 dark:text-white min-w-[140px] text-center">
              {MONTHS[month - 1]} {year}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-colors">
              <ChevronRight size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3 border border-green-100 dark:border-green-900/30">
            <p className="text-[11px] text-green-600 dark:text-green-400 font-medium mb-0.5">Revenus prévus</p>
            <p className="text-base font-bold text-green-700 dark:text-green-300 truncate">{formatAmount(income, cur)}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-3 border border-red-100 dark:border-red-900/30">
            <p className="text-[11px] text-red-500 dark:text-red-400 font-medium mb-0.5">Budget alloué</p>
            <p className="text-base font-bold text-red-600 dark:text-red-400 truncate">{formatAmount(totalBudget, cur)}</p>
          </div>
          <div className={`rounded-xl p-3 border ${remaining >= 0 ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-900/30' : 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-100 dark:border-orange-900/30'}`}>
            <p className={`text-[11px] font-medium mb-0.5 ${remaining >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-500'}`}>
              {remaining >= 0 ? 'Reste à allouer' : 'Dépassement'}
            </p>
            <p className={`text-base font-bold truncate ${remaining >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-600'}`}>
              {formatAmount(Math.abs(remaining), cur)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-3 border border-purple-100 dark:border-purple-900/30">
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mb-0.5">Tâches</p>
            <p className="text-base font-bold text-purple-700 dark:text-purple-300">
              {planLoading ? '…' : `${doneTodos}/${todos.length}`}
            </p>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ── Left : Plan & Budget ── */}
          <div className="space-y-4">

            {/* Income goal */}
            <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Wallet size={15} className="text-green-500" />
                <h2 className="font-semibold text-sm text-gray-800 dark:text-white">Revenus prévus ce mois</h2>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={incomeGoal}
                  onChange={e => setIncomeGoal(e.target.value)}
                  placeholder="Ex : 500 000"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-dark-border rounded-lg bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-white outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition"
                />
                <span className="text-xs font-semibold text-gray-400 w-12 text-center">{cur}</span>
              </div>
            </div>

            {/* Budget per category */}
            <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Target size={15} className="text-gold" />
                <h2 className="font-semibold text-sm text-gray-800 dark:text-white">Budget par catégorie</h2>
              </div>

              <div className="space-y-3">
                {PLAN_CATEGORIES.map(cat => {
                  const val = parseFloat(budgets[cat.key] || '0') || 0
                  const pct = income > 0 ? Math.min((val / income) * 100, 100) : 0
                  const color = CATEGORY_COLORS[cat.key] || '#9CA3AF'
                  const label = CATEGORY_LABELS_FR[cat.key] || cat.key

                  return (
                    <div key={cat.key}>
                      <div className="flex items-center gap-2">
                        <span className="text-base w-6 text-center flex-shrink-0">{cat.emoji}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 min-w-0 truncate">{label}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <input
                            type="number"
                            value={budgets[cat.key] || ''}
                            onChange={e => setBudgets(p => ({ ...p, [cat.key]: e.target.value }))}
                            placeholder="0"
                            className="w-28 px-2 py-1 text-xs text-right border border-gray-200 dark:border-dark-border rounded-lg bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-white outline-none focus:border-gold transition"
                          />
                          {income > 0 && val > 0 && (
                            <span className="text-[10px] text-gray-400 w-8 text-right">{Math.round(pct)}%</span>
                          )}
                        </div>
                      </div>
                      {pct > 0 && (
                        <div className="ml-8 mt-1 h-1 bg-gray-100 dark:bg-dark-bg rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: color }} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Total line */}
              {totalBudget > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <TrendingDown size={12} />
                    Total budget
                  </span>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {formatAmount(totalBudget, cur)}
                  </span>
                </div>
              )}

              <button
                onClick={handleSavePlan}
                disabled={saving}
                className="mt-4 w-full py-2.5 bg-gold hover:bg-yellow-500 disabled:opacity-50 text-[#1A1A2E] text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Enregistrement…' : 'Enregistrer le plan'}
              </button>
            </div>
          </div>

          {/* ── Right : To-Do ── */}
          <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4 shadow-sm flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ListTodo size={15} className="text-purple-500" />
                <h2 className="font-semibold text-sm text-gray-800 dark:text-white">To-Do du mois</h2>
                {todos.length > 0 && (
                  <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {doneTodos}/{todos.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowTodoForm(v => !v)}
                className="flex items-center gap-1 text-xs bg-gold/10 hover:bg-gold/20 text-yellow-700 dark:text-yellow-400 px-2.5 py-1.5 rounded-lg font-semibold transition-colors"
              >
                <Plus size={12} />
                Ajouter
              </button>
            </div>

            {/* Add form */}
            {showTodoForm && (
              <div className="mb-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border space-y-2">
                <input
                  autoFocus
                  type="text"
                  value={newTodo}
                  onChange={e => setNewTodo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTodo()}
                  placeholder="Ex : Payer le loyer…"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-800 dark:text-white outline-none focus:border-gold transition"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newTodoAmt}
                    onChange={e => setNewTodoAmt(e.target.value)}
                    placeholder={`Montant (${cur})`}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-800 dark:text-white outline-none focus:border-gold transition"
                  />
                  <button
                    onClick={handleAddTodo}
                    disabled={addingTodo || !newTodo.trim()}
                    className="px-4 py-2 bg-gold hover:bg-yellow-500 disabled:opacity-40 text-[#1A1A2E] text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    {addingTodo ? <Loader2 size={12} className="animate-spin" /> : 'OK'}
                  </button>
                </div>
              </div>
            )}

            {/* List */}
            {planLoading ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-gray-300" size={24} />
              </div>
            ) : todos.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <span className="text-5xl mb-3">📋</span>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aucune tâche pour ce mois</p>
                <p className="text-xs text-gray-400 mt-1">Ajoutez des tâches pour suivre vos actions</p>
              </div>
            ) : (
              <div className="flex-1 space-y-1.5 overflow-y-auto">
                {todos.map(todo => (
                  <div
                    key={todo.id}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all group ${
                      todo.isDone
                        ? 'bg-green-50 dark:bg-green-900/10'
                        : 'hover:bg-gray-50 dark:hover:bg-dark-bg'
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTodo.mutate({ id: todo.id, isDone: !todo.isDone })}
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        todo.isDone
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gold'
                      }`}
                    >
                      {todo.isDone && <Check size={11} className="text-white" strokeWidth={3} />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${todo.isDone ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                        {todo.title}
                      </p>
                      {todo.amount != null && todo.amount > 0 && (
                        <p className="text-xs text-gray-400">{formatAmount(todo.amount, cur)}</p>
                      )}
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeTodo.mutate(todo.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all text-red-400 flex-shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            {todos.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-border space-y-2">
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>Progression</span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-dark-bg rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        background: progress === 100
                          ? 'linear-gradient(90deg,#10B981,#34D399)'
                          : 'linear-gradient(90deg,#A78BFA,#8B5CF6)',
                      }}
                    />
                  </div>
                </div>
                {/* Amount total */}
                {todoAmt > 0 && (
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Total des tâches</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{formatAmount(todoAmt, cur)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
