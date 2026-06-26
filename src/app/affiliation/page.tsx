'use client'
import { useState, useEffect } from 'react'
import { Copy, Check, Users, TrendingUp, Wallet, Gift, ArrowRight, Loader2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'

interface Filleul {
  id: string
  firstName: string
  lastName: string
  plan: string
  createdAt: string
  isSubscribed: boolean
}

interface Earning {
  id: string
  amount: number
  month: string
  filleulName: string
  status: 'pending' | 'paid'
  createdAt: string
}

export default function AffiliationPage() {
  const { user } = useAppStore()
  const [copied, setCopied] = useState(false)
  const [filleuls, setFilleuls] = useState<Filleul[]>([])
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [loading, setLoading] = useState(true)
  const [refCode, setRefCode] = useState('')

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://funtrack.app'
  const refLink = `${appUrl}/auth?ref=${refCode}`

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  async function loadData() {
    setLoading(true)
    try {
      // Récupérer ou créer le code de parrainage
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user!.id)
        .single()

      if (profile?.referral_code) {
        setRefCode(profile.referral_code)
      } else {
        // Générer un code unique
        const code = generateCode(user!.firstName, user!.id)
        await supabase.from('profiles').update({ referral_code: code }).eq('id', user!.id)
        setRefCode(code)
      }

      // Filleuls
      const { data: refs } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, plan, created_at')
        .eq('referred_by', user!.id)
        .order('created_at', { ascending: false })

      if (refs) {
        setFilleuls(refs.map(r => ({
          id: r.id,
          firstName: r.first_name || '',
          lastName: r.last_name || '',
          plan: r.plan || 'starter',
          createdAt: r.created_at,
          isSubscribed: r.plan !== 'starter',
        })))
      }

      // Gains d'affiliation
      const { data: earn } = await supabase
        .from('affiliate_earnings')
        .select('*')
        .eq('referrer_id', user!.id)
        .order('created_at', { ascending: false })

      if (earn) {
        setEarnings(earn.map(e => ({
          id: e.id,
          amount: e.amount,
          month: e.month,
          filleulName: e.filleul_name || '',
          status: e.status,
          createdAt: e.created_at,
        })))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function generateCode(firstName: string, uid: string) {
    const base = firstName.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X')
    const suffix = uid.slice(-5).toUpperCase()
    return `${base}${suffix}`
  }

  function copyLink() {
    navigator.clipboard.writeText(refLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalPending = earnings.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0)
  const totalPaid = earnings.filter(e => e.status === 'paid').reduce((s, e) => s + e.amount, 0)
  const activeFilleuls = filleuls.filter(f => f.isSubscribed).length

  return (
    <AppLayout>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Gift size={20} className="text-gold" /> Programme d'affiliation
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Gagnez <span className="font-bold text-gold">15%</span> de chaque abonnement de vos filleuls, chaque mois</p>
      </div>

      {/* Comment ça marche */}
      <Card className="mb-5 bg-gradient-to-br from-gold/5 to-blue-50 dark:from-gold/10 dark:to-blue-900/20 border-gold/20">
        <CardTitle><Gift size={16} className="text-gold"/> Comment ça marche</CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
          {[
            { step: '1', icon: '🔗', title: 'Partagez votre lien', desc: 'Envoyez votre lien unique à vos contacts' },
            { step: '2', icon: '👤', title: 'Ils s\'inscrivent', desc: 'Vos filleuls créent leur compte FUNTRACK' },
            { step: '3', icon: '💰', title: 'Vous gagnez 15%', desc: 'Chaque mois qu\'ils sont abonnés, vous recevez 15%' },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gold text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{s.step}</div>
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-white">{s.icon} {s.title}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Lien de parrainage */}
      <Card className="mb-5">
        <CardTitle><ArrowRight size={16} className="text-gold"/> Votre lien de parrainage</CardTitle>
        {loading ? (
          <div className="flex items-center gap-2 mt-3"><Loader2 size={14} className="animate-spin text-gold"/> Chargement...</div>
        ) : (
          <div className="mt-3">
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border">
              <code className="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">{refLink}</code>
              <button onClick={copyLink} className="flex-shrink-0 p-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold transition-colors">
                {copied ? <Check size={14}/> : <Copy size={14}/>}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">Votre code : <span className="font-bold text-gold">{refCode}</span></p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Button size="sm" onClick={copyLink}>{copied ? <Check size={12}/> : <Copy size={12}/>} Copier le lien</Button>
              <Button size="sm" variant="outline" onClick={() => {
                const msg = `Rejoins FUNTRACK — l'appli de gestion financière pour l'Afrique 🌍\nInscris-toi gratuitement avec mon lien : ${refLink}`
                if (navigator.share) navigator.share({ title: 'FUNTRACK', text: msg, url: refLink })
                else window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
              }}>
                📲 Partager sur WhatsApp
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard icon="👥" label="Total filleuls" value={filleuls.length.toString()} color="text-blue-500"/>
        <StatCard icon="✅" label="Filleuls actifs" value={activeFilleuls.toString()} sub="abonnés payants" color="text-green-600"/>
        <StatCard icon="⏳" label="Gains en attente" value={`${totalPending.toLocaleString('fr-FR')} F`} color="text-yellow-600"/>
        <StatCard icon="💸" label="Total encaissé" value={`${totalPaid.toLocaleString('fr-FR')} F`} color="text-gold"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Liste filleuls */}
        <Card>
          <CardTitle><Users size={16} className="text-gold"/> Mes filleuls ({filleuls.length})</CardTitle>
          {filleuls.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">🤝</p>
              <p className="text-xs">Aucun filleul pour le moment</p>
              <p className="text-[11px] mt-1">Partagez votre lien pour commencer</p>
            </div>
          ) : (
            <div className="space-y-2 mt-3">
              {filleuls.map(f => (
                <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-dark-bg">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold">
                    {f.firstName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{f.firstName} {f.lastName}</p>
                    <p className="text-[10px] text-gray-400">Inscrit le {new Date(f.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${f.isSubscribed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {f.isSubscribed ? '✅ Abonné' : '⏳ Gratuit'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Historique gains */}
        <Card>
          <CardTitle><TrendingUp size={16} className="text-gold"/> Historique des gains</CardTitle>
          {earnings.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">💰</p>
              <p className="text-xs">Aucun gain pour le moment</p>
              <p className="text-[11px] mt-1">Vos commissions apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-2 mt-3">
              {earnings.map(e => (
                <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-dark-bg">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{e.filleulName}</p>
                    <p className="text-[10px] text-gray-400">{e.month}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">+{e.amount.toLocaleString('fr-FR')} F</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${e.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {e.status === 'paid' ? 'Payé' : 'En attente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Retrait */}
      {totalPending > 0 && (
        <Card className="mt-4 border-gold/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Wallet size={16} className="text-gold"/> Solde disponible : <span className="text-gold">{totalPending.toLocaleString('fr-FR')} F</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Demandez un retrait vers votre Wave ou Orange Money</p>
            </div>
            <Button size="sm" onClick={() => alert('Demande de retrait envoyée ! Vous serez contacté sous 48h.')}>
              Retirer
            </Button>
          </div>
        </Card>
      )}
    </AppLayout>
  )
}

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub?: string; color: string }) {
  return (
    <Card>
      <p className="text-xl mb-1">{icon}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[11px] text-gray-500">{label}</p>
      {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
    </Card>
  )
}
