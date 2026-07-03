'use client'
import { useState, useRef } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  useMonthlyPlan, usePlanWeeklyGoals, usePlanRoutineTasks,
  usePlanRoutineEntries, usePlanTodos,
} from '@/hooks/usePlan'
import { useAppStore } from '@/store/useAppStore'
import {
  CalendarDays, ChevronLeft, ChevronRight, ChevronDown,
  Plus, Trash2, Check, Loader2, X,
} from 'lucide-react'
import { formatAmount } from '@/lib/utils'
import toast from 'react-hot-toast'

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const MONTHS_FR_MIN = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
const DAY_FR = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

function getDayName(year: number, month: number, day: number) {
  return DAY_FR[(new Date(year, month - 1, day).getDay() + 6) % 7]
}
function isSunday(year: number, month: number, day: number) {
  return new Date(year, month - 1, day).getDay() === 0
}
function isPast(year: number, month: number, day: number) {
  const d = new Date(year, month - 1, day); d.setHours(23,59,59)
  return d < new Date()
}
function isWeekPast(year: number, month: number, endDay: number) {
  const d = new Date(year, month - 1, endDay); d.setHours(23,59,59)
  return d < new Date()
}

function getMonthWeeks(year: number, month: number) {
  const total = new Date(year, month, 0).getDate()
  const weeks: { label: string; days: number[]; start: number; end: number }[] = []
  let cur: number[] = []
  for (let d = 1; d <= total; d++) {
    cur.push(d)
    const dow = new Date(year, month - 1, d).getDay()
    if (dow === 0 || d === total) {
      weeks.push({ label: `Semaine ${weeks.length + 1}`, days: [...cur], start: cur[0], end: d })
      cur = []
    }
  }
  return weeks
}

function fmtDates(year: number, month: number, s: number, e: number) {
  const m = MONTHS_FR_MIN[month - 1]
  return s === e ? `${s} ${m}` : `${s} – ${e} ${m}`
}

function getCurrentWeekIdx(year: number, month: number) {
  const today = new Date()
  if (today.getFullYear() !== year || today.getMonth() + 1 !== month) return 0
  const d = today.getDate()
  const weeks = getMonthWeeks(year, month)
  const idx = weeks.findIndex(w => w.days.includes(d))
  return idx >= 0 ? idx : 0
}

// ── Page ──────────────────────────────────────────────────────────────────────
type Tab = 'objectifs' | 'routine' | 'taches'

export default function PlanificationPage() {
  const { user } = useAppStore()
  const cur = (user?.currency || 'XOF') as any
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [tab, setTab] = useState<Tab>('objectifs')

  const weeks = getMonthWeeks(year, month)

  // nav
  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y-1) } else setMonth(m => m-1) }
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y+1) } else setMonth(m => m+1) }

  // data
  const { data: plan, isLoading: planLoading, ensurePlan } = useMonthlyPlan(month, year)
  const { data: weeklyGoals = [] } = usePlanWeeklyGoals(plan?.id)
  const { data: routineTasks = [], addTask, removeTask } = usePlanRoutineTasks(plan?.id)
  const { data: routineEntries = {}, toggle: toggleEntry } = usePlanRoutineEntries(plan?.id)
  const { data: todos = [], create: createTodo, toggle: toggleTodo, remove: removeTodo } = usePlanTodos(plan?.id)

  // monthly income goal
  const [incomeGoal, setIncomeGoal] = useState('')
  const [savingIncome, setSavingIncome] = useState(false)

  const handleSaveIncome = async () => {
    setSavingIncome(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      const planId = await ensurePlan(parseFloat(incomeGoal) || 0)
      await supabase.from('monthly_plans').update({ income_goal: parseFloat(incomeGoal) || 0 }).eq('id', planId)
      toast.success('Objectif mensuel enregistré')
    } catch (e: any) { toast.error(e.message) }
    finally { setSavingIncome(false) }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <CalendarDays size={20} className="text-gold" />
              Planification mensuelle
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Objectif, routine et tâches du mois</p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2 shadow-sm">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-colors"><ChevronLeft size={15} className="text-gray-500" /></button>
            <span className="font-semibold text-sm text-gray-800 dark:text-white min-w-[130px] text-center">{MONTHS_FR[month-1]} {year}</span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-colors"><ChevronRight size={15} className="text-gray-500" /></button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex bg-gray-100 dark:bg-dark-bg rounded-xl p-1 gap-1">
          {(['objectifs','routine','taches'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${tab === t ? 'bg-white dark:bg-dark-card text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              {t === 'objectifs' ? '💰 Objectifs' : t === 'routine' ? '📋 To Do List' : '📌 Tâches'}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        {tab === 'objectifs' && (
          <ObjectifsTab
            month={month} year={year} weeks={weeks} cur={cur}
            plan={plan} planLoading={planLoading}
            weeklyGoals={weeklyGoals} ensurePlan={ensurePlan}
            incomeGoal={incomeGoal} setIncomeGoal={setIncomeGoal}
            savingIncome={savingIncome} onSaveIncome={handleSaveIncome}
          />
        )}
        {tab === 'routine' && (
          <RoutineTab
            month={month} year={year} weeks={weeks}
            plan={plan} planLoading={planLoading}
            routineTasks={routineTasks} routineEntries={routineEntries}
            toggleEntry={toggleEntry} addTask={addTask} removeTask={removeTask}
            ensurePlan={ensurePlan}
          />
        )}
        {tab === 'taches' && (
          <TachesTab
            plan={plan} planLoading={planLoading}
            todos={todos} createTodo={createTodo} toggleTodo={toggleTodo} removeTodo={removeTodo}
            ensurePlan={ensurePlan}
          />
        )}
      </div>
    </AppLayout>
  )
}

// ══ Tab Objectifs ═════════════════════════════════════════════════════════════
function ObjectifsTab({ month, year, weeks, cur, plan, planLoading, weeklyGoals, ensurePlan, incomeGoal, setIncomeGoal, savingIncome, onSaveIncome }: any) {
  // local state for weekly inputs: { weekNumber -> { target, realized, achieved } }
  const [local, setLocal] = useState<Record<number,{target:string;realized:string;achieved:boolean}>>({})
  const [saving, setSaving] = useState<number|null>(null)

  // sync from DB
  useState(() => {
    const init: Record<number,{target:string;realized:string;achieved:boolean}> = {}
    weeks.forEach((_:any, i:number) => {
      const wn = i + 1
      const db = weeklyGoals.find((g:any) => g.weekNumber === wn)
      init[wn] = { target: db?.targetAmount ? String(db.targetAmount) : '', realized: db?.realizedAmount != null ? String(db.realizedAmount) : '', achieved: db?.isAchieved || false }
    })
    setLocal(init)
  })

  // total
  const totalTarget = Object.values(local).reduce((s:number, v:any) => s + (parseFloat(v.target)||0), 0)
  const totalRealized = Object.values(local).reduce((s:number, v:any) => s + (parseFloat(v.realized)||0), 0)

  const saveWeek = async (weekNumber: number) => {
    setSaving(weekNumber)
    try {
      const { usePlanWeeklyGoals } = await import('@/hooks/usePlan')
      const planId = await ensurePlan()
      const { supabase } = await import('@/lib/supabase')
      const row = local[weekNumber]
      await supabase.from('plan_weekly_goals').upsert({
        plan_id: planId,
        user_id: (await import('@/lib/supabase').then(m => m.ensureSession))(),
        week_number: weekNumber,
        target_amount: parseFloat(row.target) || 0,
        realized_amount: row.realized !== '' ? parseFloat(row.realized) : null,
        is_achieved: row.achieved,
      }, { onConflict: 'plan_id,week_number' })
      toast.success('Semaine enregistrée')
    } catch(e:any) { toast.error(e.message) }
    finally { setSaving(null) }
  }

  if (planLoading) return <Loader />

  return (
    <div className="space-y-4">
      {/* Objectif mensuel */}
      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Objectif mensuel de revenus</p>
        <div className="flex gap-2">
          <input type="number" value={incomeGoal} onChange={e => setIncomeGoal(e.target.value)}
            placeholder={plan?.incomeGoal ? String(plan.incomeGoal) : 'Ex : 500 000'}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-dark-border rounded-lg bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-white outline-none focus:border-gold transition" />
          <span className="flex items-center text-xs font-semibold text-gray-400 px-1">{cur}</span>
          <button onClick={onSaveIncome} disabled={savingIncome || !incomeGoal}
            className="px-4 py-2 bg-gold hover:bg-yellow-500 disabled:opacity-40 text-[#1A1A2E] text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
            {savingIncome ? <Loader2 size={12} className="animate-spin"/> : 'OK'}
          </button>
        </div>
        {plan?.incomeGoal ? <p className="text-[11px] text-gray-400 mt-1">Actuel : {formatAmount(plan.incomeGoal, cur)}</p> : null}
      </div>

      {/* Tableau semaines */}
      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1B2A4A] text-white text-xs">
                <th className="px-3 py-3 text-left font-semibold">Semaine</th>
                <th className="px-3 py-3 text-left font-semibold hidden sm:table-cell">Dates</th>
                <th className="px-3 py-3 text-center font-semibold">Objectif</th>
                <th className="px-3 py-3 text-center font-semibold">Réalisé</th>
                <th className="px-3 py-3 text-center font-semibold hidden sm:table-cell">Écart</th>
                <th className="px-3 py-3 text-center font-semibold">✓</th>
                <th className="px-2 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((w: any, i: number) => {
                const wn = i + 1
                const past = isWeekPast(year, month, w.end)
                const row = local[wn] || { target:'', realized:'', achieved:false }
                const t = parseFloat(row.target) || 0
                const r = row.realized !== '' ? parseFloat(row.realized) : null
                const ecart = r !== null && t > 0 ? r - t : null

                return (
                  <tr key={wn} className={`border-t border-gray-100 dark:border-dark-border ${past ? 'bg-gray-50 dark:bg-dark-bg/50' : ''}`}>
                    <td className="px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 text-xs whitespace-nowrap">{w.label}</td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs hidden sm:table-cell whitespace-nowrap">{fmtDates(year, month, w.start, w.end)}</td>
                    <td className="px-2 py-2.5 text-center">
                      {past ? (
                        <span className="text-xs text-gray-400">{t > 0 ? formatAmount(t, cur) : '—'}</span>
                      ) : (
                        <input type="number" value={row.target}
                          onChange={e => setLocal(p => ({...p, [wn]:{...p[wn], target:e.target.value}}))}
                          placeholder="0" className="w-24 text-center text-xs border border-gray-200 dark:border-dark-border rounded px-2 py-1 bg-white dark:bg-dark-bg text-gray-800 dark:text-white outline-none focus:border-gold" />
                      )}
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      {past ? (
                        <span className="text-xs text-gray-400">{r !== null ? formatAmount(r, cur) : '—'}</span>
                      ) : (
                        <input type="number" value={row.realized}
                          onChange={e => setLocal(p => ({...p, [wn]:{...p[wn], realized:e.target.value}}))}
                          placeholder="0" className="w-24 text-center text-xs border border-gray-200 dark:border-dark-border rounded px-2 py-1 bg-white dark:bg-dark-bg text-gray-800 dark:text-white outline-none focus:border-gold" />
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center text-xs font-bold hidden sm:table-cell">
                      {ecart !== null ? (
                        <span className={ecart >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {ecart >= 0 ? '+' : ''}{ecart.toLocaleString('fr-FR')}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <input type="checkbox" checked={row.achieved}
                        onChange={e => setLocal(p => ({...p, [wn]:{...p[wn], achieved:e.target.checked}}))}
                        className="w-4 h-4 accent-yellow-500 cursor-pointer" />
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      {!past && (
                        <button onClick={() => saveWeek(wn)} disabled={saving === wn}
                          className="text-[10px] bg-gold/10 hover:bg-gold/20 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded font-semibold transition-colors">
                          {saving === wn ? <Loader2 size={10} className="animate-spin"/> : 'OK'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {/* Total */}
              <tr className="bg-amber-50 dark:bg-yellow-900/10 border-t-2 border-gold/30">
                <td className="px-3 py-2.5 font-bold text-xs text-gray-700 dark:text-gray-200">TOTAL</td>
                <td className="px-3 py-2.5 text-xs text-gray-500 hidden sm:table-cell">{MONTHS_FR[month-1]} {year}</td>
                <td className="px-3 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-200">{totalTarget > 0 ? formatAmount(totalTarget, cur) : '—'}</td>
                <td className="px-3 py-2.5 text-center text-xs font-bold text-gray-700 dark:text-gray-200">{totalRealized > 0 ? formatAmount(totalRealized, cur) : '—'}</td>
                <td className="px-3 py-2.5 hidden sm:table-cell"></td>
                <td className="px-3 py-2.5"></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ══ Tab Routine ═══════════════════════════════════════════════════════════════
function RoutineTab({ month, year, weeks, plan, planLoading, routineTasks, routineEntries, toggleEntry, addTask, removeTask, ensurePlan }: any) {
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(() => new Set([getCurrentWeekIdx(year, month)]))
  const [newTask, setNewTask] = useState('')
  const [adding, setAdding] = useState(false)

  const toggle = (idx: number) => setOpenWeeks(s => { const n = new Set(s); n.has(idx) ? n.delete(idx) : n.add(idx); return n })

  const handleAddTask = async () => {
    if (!newTask.trim()) return
    setAdding(true)
    try {
      await ensurePlan()
      await addTask.mutateAsync(newTask.trim())
      setNewTask('')
    } catch(e:any) { toast.error(e.message) }
    finally { setAdding(false) }
  }

  const handleToggle = async (day: number, taskId: string, isDone: boolean) => {
    try {
      await ensurePlan()
      toggleEntry.mutate({ day, taskId, isDone })
    } catch(e:any) { toast.error(e.message) }
  }

  if (planLoading) return <Loader />

  return (
    <div className="space-y-3">
      {/* Habitudes configurables */}
      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Habitudes à suivre chaque jour</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {routineTasks.map((t: any) => (
            <span key={t.id} className="flex items-center gap-1 bg-[#1B2A4A]/10 dark:bg-[#1B2A4A]/40 text-[#1B2A4A] dark:text-blue-200 text-xs font-medium px-2.5 py-1.5 rounded-lg">
              {t.label}
              <button onClick={() => removeTask.mutate(t.id)} className="ml-1 text-gray-400 hover:text-red-500 transition-colors">
                <X size={11}/>
              </button>
            </span>
          ))}
          {routineTasks.length === 0 && <p className="text-xs text-gray-400 italic">Aucune habitude. Ajoutez-en ci-dessous.</p>}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddTask()}
            placeholder="Ex : Sport, Méditation…"
            className="flex-1 px-3 py-2 text-xs border border-gray-200 dark:border-dark-border rounded-lg bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-white outline-none focus:border-gold transition" />
          <button onClick={handleAddTask} disabled={adding || !newTask.trim()}
            className="px-3 py-2 bg-gold hover:bg-yellow-500 disabled:opacity-40 text-[#1A1A2E] text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
            {adding ? <Loader2 size={11} className="animate-spin"/> : <Plus size={13}/>}
          </button>
        </div>
      </div>

      {/* Accordéons par semaine */}
      {routineTasks.length === 0 ? (
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-8 text-center text-sm text-gray-400">
          Ajoutez des habitudes pour commencer le suivi quotidien
        </div>
      ) : (
        weeks.map((w: any, idx: number) => {
          const isOpen = openWeeks.has(idx)
          const past = isWeekPast(year, month, w.end)
          const doneCount = w.days.reduce((s: number, d: number) =>
            s + routineTasks.filter((t: any) => routineEntries[`${d}-${t.id}`]).length, 0)
          const totalBoxes = w.days.length * routineTasks.length

          return (
            <div key={idx} className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden shadow-sm">
              <button onClick={() => toggle(idx)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${past ? 'bg-gray-100 dark:bg-dark-bg/60' : 'bg-[#1B2A4A] text-white'}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${past ? 'text-gray-500 dark:text-gray-400' : 'text-white'}`}>{w.label}</span>
                  <span className={`text-[10px] ${past ? 'text-gray-400' : 'text-blue-200'}`}>{fmtDates(year, month, w.start, w.end)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold ${past ? 'text-gray-400' : 'text-blue-200'}`}>{doneCount}/{totalBoxes}</span>
                  <ChevronDown size={14} className={`transition-transform ${past ? 'text-gray-400' : 'text-white'} ${isOpen ? 'rotate-180' : ''}`}/>
                </div>
              </button>

              {isOpen && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
                        <th className="px-3 py-2 text-left text-gray-500 font-semibold w-12">Jour</th>
                        <th className="px-2 py-2 text-center text-gray-500 font-semibold w-10">Date</th>
                        {routineTasks.map((t: any) => (
                          <th key={t.id} className="px-2 py-2 text-center text-gray-500 font-semibold max-w-[80px] truncate">{t.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {w.days.map((d: number) => {
                        const sun = isSunday(year, month, d)
                        return (
                          <tr key={d} className={`border-b border-gray-50 dark:border-dark-border/50 ${sun ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                            <td className={`px-3 py-2 font-medium ${sun ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>{getDayName(year, month, d)}</td>
                            <td className={`px-2 py-2 text-center font-bold ${sun ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{d}</td>
                            {routineTasks.map((t: any) => {
                              const done = !!routineEntries[`${d}-${t.id}`]
                              return (
                                <td key={t.id} className="px-2 py-2 text-center">
                                  <button onClick={() => handleToggle(d, t.id, !done)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mx-auto transition-all ${done ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600 hover:border-gold'}`}>
                                    {done && <Check size={11} className="text-white" strokeWidth={3}/>}
                                  </button>
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

// ══ Tab Tâches ═════════════════════════════════════════════════════════════════
function TachesTab({ plan, planLoading, todos, createTodo, toggleTodo, removeTodo, ensurePlan }: any) {
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      await ensurePlan()
      await createTodo.mutateAsync({ title: newTitle.trim(), dateLabel: newDate.trim() || undefined })
      setNewTitle(''); setNewDate('')
    } catch(e:any) { toast.error(e.message) }
    finally { setAdding(false) }
  }

  if (planLoading) return <Loader />

  return (
    <div className="space-y-3">
      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1B2A4A] text-white text-xs">
                <th className="px-4 py-3 text-left font-semibold">Tâche</th>
                <th className="px-3 py-3 text-center font-semibold w-28 hidden sm:table-cell">Date</th>
                <th className="px-3 py-3 text-center font-semibold w-14">Fait</th>
                <th className="px-2 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {todos.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400 italic">Aucune tâche occasionnelle pour ce mois</td></tr>
              )}
              {todos.map((t: any) => (
                <tr key={t.id} className={`border-t border-gray-100 dark:border-dark-border group transition-colors ${t.isDone ? 'bg-green-50/50 dark:bg-green-900/10' : 'hover:bg-gray-50 dark:hover:bg-dark-bg/50'}`}>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${t.isDone ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white font-medium'}`}>{t.title}</span>
                  </td>
                  <td className="px-3 py-3 text-center text-xs text-gray-500 hidden sm:table-cell">{t.dateLabel || '—'}</td>
                  <td className="px-3 py-3 text-center">
                    <button onClick={() => toggleTodo.mutate({ id: t.id, isDone: !t.isDone })}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mx-auto transition-all ${t.isDone ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600 hover:border-gold'}`}>
                      {t.isDone && <Check size={10} className="text-white" strokeWidth={3}/>}
                    </button>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <button onClick={() => removeTodo.mutate(t.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-400 transition-all">
                      <Trash2 size={13}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add row */}
        <div className="p-3 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg flex flex-col sm:flex-row gap-2">
          <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Ajouter une tâche occasionnelle…"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-800 dark:text-white outline-none focus:border-gold transition" />
          <input type="text" value={newDate} onChange={e => setNewDate(e.target.value)}
            placeholder="Date (ex : 10 juillet)"
            className="w-40 px-3 py-2 text-sm border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-800 dark:text-white outline-none focus:border-gold transition" />
          <button onClick={handleAdd} disabled={adding || !newTitle.trim()}
            className="px-4 py-2 bg-gold hover:bg-yellow-500 disabled:opacity-40 text-[#1A1A2E] text-sm font-bold rounded-lg transition-colors flex items-center gap-1 justify-center">
            {adding ? <Loader2 size={13} className="animate-spin"/> : <><Plus size={13}/> Ajouter</>}
          </button>
        </div>
      </div>

      {/* Progress */}
      {todos.length > 0 && (
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-3 shadow-sm">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Progression</span>
            <span className="font-bold">{todos.filter((t:any)=>t.isDone).length}/{todos.length} tâches</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-dark-bg rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-yellow-400 to-green-400"
              style={{width:`${Math.round((todos.filter((t:any)=>t.isDone).length/todos.length)*100)}%`}}/>
          </div>
        </div>
      )}
    </div>
  )
}

function Loader() {
  return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-gray-300" size={28}/></div>
}
