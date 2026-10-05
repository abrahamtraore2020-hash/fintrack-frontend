'use client'
import { useState, useMemo, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Shield, Users, Crown, TrendingUp } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAppStore } from '@/store/useAppStore'
import { useAdminUsers, useUpdateRole, AdminRole, AdminUser } from '@/hooks/useAdmin'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const ROLE_CONFIG = {
  admin:     { label: '👑 Admin',   bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  moderator: { label: '🛡️ Modo',    bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  support:   { label: '💬 Support', bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
}

const PLAN_CONFIG: Record<string, string> = {
  starter:    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  pro:        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  business:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  enterprise: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
}

type RoleFilter = 'all' | 'admin' | 'moderator' | 'support' | 'user'

function initials(u: AdminUser) {
  return `${(u.firstName[0] || '?')}${(u.lastName[0] || '')}`.toUpperCase()
}

export default function AdminPage() {
  const router = useRouter()
  const { user } = useAppStore()
  const { data: users = [], isLoading } = useAdminUsers()
  const updateRole = useUpdateRole()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')

  useEffect(() => {
    if (user && !user.role) router.replace('/dashboard')
  }, [user, router])

  const filtered = useMemo(() => {
    return users
      .filter((u: any) => roleFilter === 'all' || (roleFilter === 'user' ? !u.role : u.role === roleFilter))
      .filter((u: any) => !search ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
  }, [users, roleFilter, search])

  const stats = useMemo(() => {
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    return {
      total: users.length,
      newThisMonth: users.filter((u: any) => new Date(u.createdAt) >= firstDay).length,
      proPlusCount: users.filter((u: any) => ['pro', 'business', 'enterprise'].includes(u.plan)).length,
      teamCount: users.filter((u: any) => u.role).length,
    }
  }, [users])

  const handleRoleChange = async (userId: string, role: AdminRole) => {
    try {
      await updateRole.mutateAsync({ userId, role })
      toast.success(role ? `Rôle mis à jour → ${role}` : 'Rôle retiré')
    } catch {
      toast.error('Erreur lors de la mise à jour du rôle')
    }
  }

  if (!user?.role) return null

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
          <Shield size={20} className="text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">Administration</h1>
          <p className="text-xs text-gray-500">Gérez les utilisateurs et l'équipe FINTRACK</p>
        </div>
        {user.role && (
          <span className={cn('ml-auto text-[11px] font-bold px-3 py-1 rounded-full', ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG]?.bg)}>
            {ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG]?.label}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard icon={<Users size={16} className="text-blue-600" />}    bg="bg-blue-50 dark:bg-blue-900/20"   label="Inscrits"  value={stats.total} />
        <StatCard icon={<TrendingUp size={16} className="text-green-600" />} bg="bg-green-50 dark:bg-green-900/20" label="Ce mois"   value={`+${stats.newThisMonth}`} />
        <StatCard icon={<Crown size={16} className="text-yellow-600" />}  bg="bg-yellow-50 dark:bg-yellow-900/20" label="Pro+"     value={stats.proPlusCount} />
        <StatCard icon={<Shield size={16} className="text-red-600" />}    bg="bg-red-50 dark:bg-red-900/20"      label="Équipe"   value={stats.teamCount} />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par nom ou email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search size={14} />}
          />
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-dark-bg rounded-xl p-1 flex-shrink-0 overflow-x-auto">
          {(['all', 'admin', 'moderator', 'support', 'user'] as RoleFilter[]).map(f => (
            <button key={f} onClick={() => setRoleFilter(f)}
              className={cn('px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap',
                roleFilter === f
                  ? 'bg-white dark:bg-dark-card shadow text-gray-800 dark:text-white'
                  : 'text-gray-400 hover:text-gray-600')}>
              {f === 'all' ? 'Tous' : f === 'user' ? 'Membres' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
          <span className="w-7 text-[10px] font-bold text-gray-400 uppercase">#</span>
          <span className="flex-1 text-[10px] font-bold text-gray-400 uppercase">Utilisateur</span>
          <span className="hidden sm:block w-44 text-[10px] font-bold text-gray-400 uppercase">Email</span>
          <span className="w-20 text-[10px] font-bold text-gray-400 uppercase text-center">Plan</span>
          <span className="w-28 text-[10px] font-bold text-gray-400 uppercase">Rôle</span>
          <span className="hidden sm:block w-20 text-[10px] font-bold text-gray-400 uppercase">Inscrit</span>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm animate-pulse">Chargement des utilisateurs…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-2xl mb-2">👥</p>
            <p className="text-sm">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div>
            {filtered.map((u: any, i: number) => (
              <div key={u.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors border-b border-gray-50 dark:border-dark-border/40 last:border-0">
                <span className="w-7 text-[11px] text-gray-400 font-medium flex-shrink-0">{i + 1}</span>

                {/* Avatar + Nom */}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-yellow-700 dark:text-yellow-400">
                    {initials(u)}
                  </div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                    {u.firstName} {u.lastName}
                  </p>
                </div>

                {/* Email */}
                <span className="hidden sm:block w-44 text-[11px] text-gray-400 truncate flex-shrink-0">{u.email}</span>

                {/* Plan */}
                <div className="w-20 flex justify-center flex-shrink-0">
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', PLAN_CONFIG[u.plan] || PLAN_CONFIG.starter)}>
                    {u.plan.charAt(0).toUpperCase() + u.plan.slice(1)}
                  </span>
                </div>

                {/* Rôle */}
                <div className="w-28 flex-shrink-0">
                  {user.role === 'admin' ? (
                    <select
                      value={u.role || ''}
                      onChange={e => handleRoleChange(u.id, (e.target.value as AdminRole) || null)}
                      disabled={updateRole.isPending}
                      className="w-full text-[11px] rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg px-2 py-1 text-gray-700 dark:text-gray-300 cursor-pointer disabled:opacity-50">
                      <option value="">— Membre</option>
                      <option value="admin">👑 Admin</option>
                      <option value="moderator">🛡️ Modo</option>
                      <option value="support">💬 Support</option>
                    </select>
                  ) : u.role ? (
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', ROLE_CONFIG[u.role as keyof typeof ROLE_CONFIG]?.bg)}>
                      {ROLE_CONFIG[u.role as keyof typeof ROLE_CONFIG]?.label}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400">—</span>
                  )}
                </div>

                {/* Date */}
                <span className="hidden sm:block w-20 text-[11px] text-gray-400 flex-shrink-0">
                  {new Date(u.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <p className="text-center text-[11px] text-gray-400 mt-3">
        {filtered.length} utilisateur{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}
      </p>
    </AppLayout>
  )
}

function StatCard({ icon, bg, label, value }: { icon: ReactNode; bg: string; label: string; value: string | number }) {
  return (
    <div className={cn('rounded-xl px-4 py-3 flex items-center gap-3', bg)}>
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] text-gray-500">{label}</p>
        <p className="text-sm font-bold text-gray-800 dark:text-white">{value}</p>
      </div>
    </div>
  )
}
