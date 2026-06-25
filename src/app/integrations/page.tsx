'use client'
import { useState } from 'react'
import { Plus, Eye, EyeOff, Trash2, RefreshCw, TrendingUp, TrendingDown, CheckCircle, ChevronDown, ChevronUp, Link2, Globe, ShoppingBag, Loader2, Key } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useAppStore } from '@/store/useAppStore'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import { Account, Transaction } from '@/types'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

// ── SVG Logos ──────────────────────────────────────────────────────────────────
function WaveLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#0D47FF"/>
      <path d="M7 22c2.5-5 5-7 7-5s5 8 7 5 5-10 7-7 2.5 7 5 5" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
    </svg>
  )
}
function OrangeLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#FF6600"/>
      <circle cx="20" cy="20" r="9" fill="white"/>
      <text x="20" y="24.5" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#FF6600" fontFamily="Arial">OM</text>
    </svg>
  )
}
function MTNLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#FFC200"/>
      <text x="20" y="25" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1A1A1A" fontFamily="Arial">MTN</text>
    </svg>
  )
}
function MoovLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#00AEEF"/>
      <text x="20" y="25" textAnchor="middle" fontSize="10" fontWeight="800" fill="white" fontFamily="Arial">MOOV</text>
    </svg>
  )
}
function StripeLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#635BFF"/>
      <path d="M17.5 22c0-1.6 1.2-2.2 3.1-2.2 2.8 0 5.4.8 5.4.8v-3.3s-2.7-.7-5.5-.7c-3.7 0-6.1 1.9-6.1 4.9 0 4.8 6.6 4 6.6 6 0 1.8-1.5 2.2-3.3 2.2-2.9 0-5.8-1.1-5.8-1.1v3.3s2.8.9 5.9.9c3.8 0 6.5-1.9 6.5-5-.1-5-6.8-4.1-6.8-5.8z" fill="white"/>
    </svg>
  )
}
function PayPalLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#003087"/>
      <path d="M25 11h-8a1.2 1.2 0 00-1.2 1l-3.3 17c-.1.5.3 1 .8 1h4l1-6.3v.4a1.2 1.2 0 011.2-1h2.2c4.5 0 8-1.8 9-7.2.1-.3.1-.7.1-1C30.8 12.7 28.2 11 25 11z" fill="#009CDE"/>
      <path d="M30.8 16c-1 5.4-4.5 7.2-9 7.2h-2.2a1.2 1.2 0 00-1.2 1l-1.5 9h3.4l.3-2v.1a1.2 1.2 0 011.2-1h2.3c4 0 7-1.6 7.9-6.3.3-1.7.1-3.1-.7-4z" fill="white" opacity=".7"/>
    </svg>
  )
}
function ShopifyLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#96BF48"/>
      <text x="20" y="25" textAnchor="middle" fontSize="8" fontWeight="700" fill="white" fontFamily="Arial">SHOPIFY</text>
    </svg>
  )
}
function UrlLogo({ size = 40, name }: { size?: number; name: string }) {
  const colors = ['#6366F1','#8B5CF6','#EC4899','#F97316','#14B8A6','#0EA5E9']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill={color}/>
      <text x="20" y="25" textAnchor="middle" fontSize="12" fontWeight="800" fill="white" fontFamily="Arial">
        {name.slice(0, 2).toUpperCase()}
      </text>
    </svg>
  )
}

// ── Provider catalog ───────────────────────────────────────────────────────────
const MOBILE_MONEY_PROVIDERS = [
  { id: 'wave',         name: 'Wave',         Logo: WaveLogo,   field: 'phone', placeholder: '+225 07 XX XX XX' },
  { id: 'orange_money', name: 'Orange Money', Logo: OrangeLogo, field: 'phone', placeholder: '+225 07 XX XX XX' },
  { id: 'mtn_money',   name: 'MTN Money',    Logo: MTNLogo,    field: 'phone', placeholder: '+225 05 XX XX XX' },
  { id: 'moov_money',  name: 'Moov Money',   Logo: MoovLogo,   field: 'phone', placeholder: '+225 01 XX XX XX' },
]

const PLATFORM_PROVIDERS = [
  { id: 'stripe',  name: 'Stripe',  Logo: StripeLogo,  field: 'api',   placeholder: 'sk_live_...' },
  { id: 'paypal',  name: 'PayPal',  Logo: PayPalLogo,  field: 'api',   placeholder: 'Client ID:Secret' },
  { id: 'shopify', name: 'Shopify', Logo: ShopifyLogo, field: 'url',   placeholder: 'https://monshop.myshopify.com/api' },
]

// ── Mock transaction generator ──────────────────────────────────────────────────
function genTx(accountId: string, provider: string, name: string): Transaction[] {
  const templates: Record<string, { type: 'income'|'expense'; amount: number; category: any; description: string }[]> = {
    wave:         [{ type:'income', amount:150000, category:'salary',   description:'Wave – Virement reçu' }, { type:'expense', amount:24500, category:'food', description:'Wave – Paiement marchand' }, { type:'income', amount:50000, category:'salary', description:'Wave – Transfert ami' }, { type:'expense', amount:5000, category:'utilities', description:'Wave – Facture CIE' }],
    orange_money: [{ type:'income', amount:80000, category:'salary',    description:'OM – Transfert reçu' }, { type:'expense', amount:15000, category:'transport', description:'OM – Recharge carburant' }, { type:'expense', amount:3000, category:'utilities', description:'OM – Forfait internet' }],
    mtn_money:    [{ type:'income', amount:60000, category:'salary',    description:'MTN MoMo – Transfert' }, { type:'expense', amount:8000, category:'utilities', description:'MTN – Forfait data' }],
    moov_money:   [{ type:'income', amount:45000, category:'salary',    description:'Moov – Transfert reçu' }, { type:'expense', amount:12000, category:'food', description:'Moov – Paiement marchand' }],
    stripe:       [{ type:'income', amount:200000, category:'freelance', description:`Stripe – Paiement client` }, { type:'income', amount:135000, category:'freelance', description:'Stripe – Facture #1042' }, { type:'expense', amount:6700, category:'utilities', description:'Stripe – Frais 3.4%' }],
    paypal:       [{ type:'income', amount:95000, category:'freelance',  description:'PayPal – Paiement reçu' }, { type:'expense', amount:4750, category:'utilities', description:'PayPal – Commission 5%' }],
    shopify:      [{ type:'income', amount:180000, category:'freelance', description:`${name} – Vente en ligne` }, { type:'income', amount:95000, category:'freelance', description:`${name} – Commande #234` }, { type:'expense', amount:9000, category:'utilities', description:`${name} – Frais plateforme` }],
    custom:       [{ type:'income', amount:120000, category:'freelance', description:`${name} – Paiement reçu` }, { type:'income', amount:75000, category:'freelance', description:`${name} – Transaction #1` }, { type:'expense', amount:6000, category:'utilities', description:`${name} – Frais service` }],
  }
  const list = templates[provider] || templates.custom
  const now = Date.now()
  return list.map((t, i) => ({
    id: `tx-${accountId}-${i}`, userId: 'current', ...t, currency: 'XOF' as const,
    date: new Date(now - i * 86400000 * (i + 1)).toISOString(),
    accountId, isRecurring: false, createdAt: new Date(now - i * 86400000 * (i + 1)).toISOString(),
  }))
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function TxRow({ tx }: { tx: Transaction }) {
  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-gray-100 dark:border-dark-border last:border-0">
      <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500')}>
        {tx.type === 'income' ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{tx.description}</p>
        <p className="text-[10px] text-gray-400">{new Date(tx.date).toLocaleDateString('fr-FR')}</p>
      </div>
      <span className={cn('text-xs font-semibold whitespace-nowrap', tx.type === 'income' ? 'text-green-600' : 'text-red-500')}>
        {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('fr-FR')} F
      </span>
    </div>
  )
}

function AccountCard({ account, allTx, onDelete, onToggleVisible, onToggleExpand, expanded, LogoEl }: {
  account: Account & { visible?: boolean; platformName?: string }
  allTx: Transaction[]
  onDelete: () => void
  onToggleVisible: () => void
  onToggleExpand: () => void
  expanded: boolean
  LogoEl: React.ReactNode
}) {
  const txs = allTx.filter(t => t.accountId === account.id)
  const income   = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  return (
    <div className="border border-gray-100 dark:border-dark-border rounded-xl p-4 mb-3 bg-white dark:bg-dark-card">
      <div className="flex items-center gap-3">
        {LogoEl}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{account.name}</p>
            <Badge variant="green"><CheckCircle size={10}/> Connecté</Badge>
          </div>
          <p className="text-[10px] text-gray-400">Sync : {account.lastSync ? new Date(account.lastSync).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onToggleVisible} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors" title={account.visible ? 'Masquer' : 'Afficher'}>
            {account.visible ? <Eye size={14}/> : <EyeOff size={14}/>}
          </button>
          <button onClick={onToggleExpand} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors">
            {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Trash2 size={13}/>
          </button>
        </div>
      </div>

      {expanded && account.visible && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-border">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-gray-400 mb-0.5">Solde estimé</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">{account.balance.toLocaleString('fr-FR')} F</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-gray-400 mb-0.5">Entrées</p>
              <p className="text-sm font-bold text-green-600">+{income.toLocaleString('fr-FR')} F</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-gray-400 mb-0.5">Sorties</p>
              <p className="text-sm font-bold text-red-500">-{expenses.toLocaleString('fr-FR')} F</p>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Transactions récentes</p>
          {txs.length > 0 ? txs.slice(0, 5).map(tx => <TxRow key={tx.id} tx={tx}/>) : (
            <div className="flex items-center gap-2 py-3 text-xs text-gray-400">
              <RefreshCw size={13} className="animate-spin"/> Synchronisation en cours...
            </div>
          )}
          {txs.length > 5 && <p className="text-xs text-center text-blue-500 mt-1.5 cursor-pointer hover:underline">{txs.length - 5} transactions supplémentaires</p>}
        </div>
      )}

      {expanded && !account.visible && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-border flex items-center gap-2 text-xs text-gray-400">
          <EyeOff size={12}/> Solde et transactions masqués
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
type ModalMode = 'mobile' | 'platform' | 'url' | 'chariow' | 'stripe' | 'paypal' | 'shopify' | 'maketou' | null

export default function IntegrationsPage() {
  const { user } = useAppStore()
  const { data: accounts = [], createAccount, removeAccount } = useAccounts()
  const { data: transactions = [], create } = useTransactions(500)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())

  const [modal, setModal]               = useState<ModalMode>(null)
  const [expandedIds, setExpandedIds]   = useState<Record<string, boolean>>({})
  const [confirmDel, setConfirmDel]     = useState<string | null>(null)

  // Chariow
  const [chariowKey, setChariowKey] = useState('')
  const [chariowLoading, setChariowLoading] = useState(false)

  // Stripe
  const [stripeKey, setStripeKey] = useState('')
  const [stripeLoading, setStripeLoading] = useState(false)

  // PayPal
  const [paypalClientId, setPaypalClientId] = useState('')
  const [paypalSecret, setPaypalSecret] = useState('')
  const [paypalLoading, setPaypalLoading] = useState(false)

  // Shopify
  const [shopifyDomain, setShopifyDomain] = useState('')
  const [shopifyToken, setShopifyToken] = useState('')
  const [shopifyLoading, setShopifyLoading] = useState(false)

  // Maketou
  const [maketouKey, setMaketouKey] = useState('')
  const [maketouLoading, setMaketouLoading] = useState(false)
  const [maketouSyncLoading, setMaketouSyncLoading] = useState(false)

  // Mobile Money form
  const [selectedMobile, setSelectedMobile] = useState('')
  const [mobilePhone, setMobilePhone]       = useState('')

  // Platform form
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [platformKey, setPlatformKey]           = useState('')

  // URL form — multiple entries
  const [urlEntries, setUrlEntries] = useState([{ name: '', url: '', token: '' }])
  const addUrlEntry  = () => setUrlEntries(p => [...p, { name: '', url: '', token: '' }])
  const removeUrlEntry = (i: number) => setUrlEntries(p => p.filter((_, idx) => idx !== i))
  const updateUrlEntry = (i: number, field: string, val: string) =>
    setUrlEntries(p => p.map((e, idx) => idx === i ? { ...e, [field]: val } : e))

  const connectedProviders = accounts.map(a => a.provider)
  const mobileAccounts     = accounts.filter(a => a.type === 'mobile_money')
  const bankAccounts       = accounts.filter(a => a.type === 'bank')
  const platformAccounts   = accounts.filter(a => a.type === 'platform' || a.type === 'custom')

  // Banques
  const [bankModal, setBankModal] = useState(false)
  const [bankName, setBankName] = useState('')
  const [bankCustomName, setBankCustomName] = useState('')
  const [bankBalance, setBankBalance] = useState('')
  const [bankLoading, setBankLoading] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvLoading, setCsvLoading] = useState(false)

  const AFRICAN_BANKS = [
    { id: 'ecobank', name: 'Ecobank', color: '#003087', abbr: 'ECO' },
    { id: 'uba', name: 'UBA', color: '#C8102E', abbr: 'UBA' },
    { id: 'coris', name: 'Coris Bank', color: '#1A5276', abbr: 'COR' },
    { id: 'sgbf', name: 'SG (Société Générale)', color: '#E60026', abbr: 'SG' },
    { id: 'bici', name: 'BICI', color: '#005BAC', abbr: 'BICI' },
    { id: 'boa', name: 'BOA (Bank of Africa)', color: '#007A3D', abbr: 'BOA' },
    { id: 'bicici', name: 'BICICI', color: '#003087', abbr: 'BIC' },
    { id: 'gtbank', name: 'GTBank', color: '#F97316', abbr: 'GT' },
    { id: 'zenith', name: 'Zenith Bank', color: '#DC2626', abbr: 'ZEN' },
    { id: 'absa', name: 'ABSA', color: '#DC143C', abbr: 'ABS' },
    { id: 'other', name: 'Autre banque', color: '#6B7280', abbr: '🏦' },
  ]

  const handleAddBank = async () => {
    const bank = AFRICAN_BANKS.find(b => b.id === bankName)
    const name = bankName === 'other' ? bankCustomName : bank?.name
    if (!name) { toast.error('Choisissez une banque'); return }
    setBankLoading(true)
    try {
      await createAccount.mutateAsync({
        type: 'bank' as any,
        provider: bankName as any,
        name,
        balance: Number(bankBalance) || 0,
        currency: 'XOF',
        isConnected: true,
        lastSync: new Date().toISOString(),
        apiKey: '',
      })
      toast.success(`${name} ajoutée !`)
      setBankModal(false)
      setBankName(''); setBankCustomName(''); setBankBalance('')
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    } finally {
      setBankLoading(false)
    }
  }

  const handleCsvImport = async (acc: { id: string }) => {
    if (!csvFile) { toast.error('Sélectionnez un fichier CSV'); return }
    setCsvLoading(true)
    try {
      const text = await csvFile.text()
      const lines = text.split('\n').filter(l => l.trim())
      const header = lines[0].split(/[,;]/).map(h => h.trim().toLowerCase())
      const idxDate   = header.findIndex(h => h.includes('date'))
      const idxAmount = header.findIndex(h => h.includes('montant') || h.includes('amount') || h.includes('credit') || h.includes('debit'))
      const idxDesc   = header.findIndex(h => h.includes('libelle') || h.includes('description') || h.includes('label'))
      let added = 0
      for (const line of lines.slice(1)) {
        const cols = line.split(/[,;]/).map(c => c.trim().replace(/"/g, ''))
        const rawAmount = Number(cols[idxAmount]?.replace(/\s/g, '').replace(',', '.')) || 0
        if (!rawAmount) continue
        await create.mutateAsync({
          type: rawAmount > 0 ? 'income' : 'expense',
          amount: Math.abs(rawAmount),
          currency: 'XOF',
          category: 'other' as any,
          description: cols[idxDesc] || 'Import banque',
          date: cols[idxDate] || new Date().toISOString().split('T')[0],
          accountId: acc.id,
          isRecurring: false,
          coffreId: undefined,
        })
        added++
      }
      toast.success(`${added} transactions importées depuis le relevé`)
      setCsvFile(null)
    } catch (e: any) {
      toast.error(e.message || 'Erreur import CSV')
    } finally {
      setCsvLoading(false)
    }
  }

  const openModal = (m: ModalMode) => setModal(m)
  const closeModal = () => {
    setModal(null)
    setSelectedMobile(''); setMobilePhone('')
    setSelectedPlatform(''); setPlatformKey('')
    setUrlEntries([{ name: '', url: '', token: '' }])
  }

  const connect = (opts: { id: string; name: string; type: any; provider: any; logoEl?: React.ReactNode }) => {
    const tempId = `temp-${Date.now()}`
    const balance = Math.floor(Math.random() * 250000) + 30000
    createAccount.mutate(
      {
        type: opts.type,
        provider: opts.provider,
        name: opts.name,
        balance,
        currency: 'XOF',
        isConnected: true,
        lastSync: new Date().toISOString(),
      },
      {
        onSuccess: (savedAcc) => {
          const realId = savedAcc.id
          const txs = genTx(realId, opts.provider, opts.name)
          txs.forEach(tx => {
            create.mutate({
              type: tx.type,
              amount: tx.amount,
              currency: tx.currency,
              category: tx.category,
              description: tx.description,
              date: tx.date,
              accountId: realId,
              isRecurring: false,
            })
          })
          setExpandedIds(p => ({ ...p, [realId]: true }))
          toast.success(`${opts.name} connecté ! Transactions importées.`)
        },
      }
    )
    return tempId
  }

  const handleConnectMobile = () => {
    if (!selectedMobile) { toast.error('Sélectionnez un service'); return }
    const prov = MOBILE_MONEY_PROVIDERS.find(p => p.id === selectedMobile)!
    connect({ id: selectedMobile, name: `${prov.name} – ${mobilePhone || user?.firstName || 'Mon compte'}`, type: 'mobile_money', provider: selectedMobile })
    closeModal()
  }

  const handleConnectPlatform = () => {
    if (!selectedPlatform) { toast.error('Sélectionnez une plateforme'); return }
    const prov = PLATFORM_PROVIDERS.find(p => p.id === selectedPlatform)!
    connect({ id: selectedPlatform, name: `${prov.name} – ${user?.firstName || 'Mon compte'}`, type: 'platform', provider: selectedPlatform })
    closeModal()
  }

  const handleConnectUrls = () => {
    const valid = urlEntries.filter(e => e.name.trim() && e.url.trim())
    if (!valid.length) { toast.error('Renseignez au moins un nom et une URL'); return }
    valid.forEach(entry => {
      connect({ id: entry.url, name: entry.name, type: 'custom', provider: 'custom' })
    })
    closeModal()
  }

  const handleDelete = (id: string) => { removeAccount.mutate(id); setConfirmDel(null) }

  const handleConnectChariow = async () => {
    if (!chariowKey.trim()) { toast.error('Entrez votre clé API Chariow'); return }
    setChariowLoading(true)
    try {
      const res = await fetch('/api/integrations/chariow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: chariowKey.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Clé API invalide'); return }

      // Sauvegarder le compte dans Supabase
      const acc = await createAccount.mutateAsync({
        type: 'platform', provider: 'custom' as any,
        name: 'Chariow',
        balance: data.revenue || 0,
        currency: 'XOF', isConnected: true,
        lastSync: new Date().toISOString(),
        apiKey: chariowKey.trim(),
      })

      // Sauvegarder les transactions
      for (const tx of data.transactions || []) {
        await create.mutateAsync({ ...tx, accountId: acc.id })
      }

      toast.success(`Chariow connecté ! ${data.total} commandes importées`)
      setModal(null)
      setChariowKey('')
    } catch (e: any) {
      toast.error(e.message || 'Erreur de connexion')
    } finally {
      setChariowLoading(false)
    }
  }

  const handleConnectApiPlatform = async (
    platform: string,
    endpoint: string,
    body: object,
    name: string,
    currency: 'XOF' | 'USD' | 'EUR',
    setLoading: (v: boolean) => void,
    onSuccess: () => void,
  ) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/integrations/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Connexion échouée'); return }

      const acc = await createAccount.mutateAsync({
        type: 'platform', provider: 'custom' as any,
        name, balance: data.revenue || 0,
        currency, isConnected: true,
        lastSync: new Date().toISOString(),
        apiKey: '',
      })
      for (const tx of data.transactions || []) {
        await create.mutateAsync({ ...tx, accountId: acc.id })
      }
      toast.success(`${name} connecté ! ${data.total} transactions importées`)
      setModal(null)
      onSuccess()
    } catch (e: any) {
      toast.error(e.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncMaketou = async (acc: { id: string; apiKey?: string }) => {
    if (!acc.apiKey) { toast.error('Clé API introuvable — reconnectez Maketou'); return }
    setMaketouSyncLoading(true)
    try {
      const res = await fetch('/api/integrations/maketou', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: acc.apiKey }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Synchronisation échouée'); return }

      // Éviter les doublons : filtrer les transactions déjà importées
      const existingKeys = new Set(
        transactions
          .filter(t => t.description?.startsWith('Maketou –'))
          .map(t => `${t.date}-${t.amount}-${t.description}`)
      )
      const newTx = (data.transactions || []).filter((t: any) =>
        !existingKeys.has(`${t.date}-${t.amount}-${t.description}`)
      )

      for (const tx of newTx) {
        await create.mutateAsync({ ...tx, accountId: acc.id })
      }

      toast.success(newTx.length > 0
        ? `✅ ${newTx.length} nouvelle(s) transaction(s) importée(s)`
        : '✅ Déjà à jour — aucune nouvelle vente'
      )
    } catch (e: any) {
      toast.error(e.message || 'Erreur de synchronisation')
    } finally {
      setMaketouSyncLoading(false)
    }
  }
  const toggleExpand = (id: string) => setExpandedIds(p => ({ ...p, [id]: !p[id] }))

  const availableMobile = MOBILE_MONEY_PROVIDERS.filter(p => !connectedProviders.includes(p.id as any))
  const availablePlatform = PLATFORM_PROVIDERS.filter(p => !connectedProviders.includes(p.id as any))

  return (
    <AppLayout>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">Mes <span className="text-glow-blue">Intégrations</span></h1>
        <p className="text-sm text-gray-500">Connectez vos comptes pour tracker automatiquement tout votre flux financier</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Section Mobile Money ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">📱 Mobile Money & Wallets</h2>
            <Button size="sm" variant="outline" onClick={() => openModal('mobile')}><Plus size={12}/> Ajouter</Button>
          </div>

          {mobileAccounts.length === 0 && (
            <div className="border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl p-6 text-center mb-3">
              <div className="flex justify-center gap-2 mb-3">
                <WaveLogo size={32}/><OrangeLogo size={32}/><MTNLogo size={32}/><MoovLogo size={32}/>
              </div>
              <p className="text-xs text-gray-400 mb-3">Connectez Wave, Orange Money, MTN, Moov pour tracker vos transactions mobile</p>
              <Button size="sm" onClick={() => openModal('mobile')}><Plus size={12}/> Connecter</Button>
            </div>
          )}

          {mobileAccounts.map(acc => {
            const prov = MOBILE_MONEY_PROVIDERS.find(p => p.id === acc.provider)
            const Logo = prov ? <prov.Logo size={40}/> : <UrlLogo size={40} name={acc.name}/>
            return (
              <AccountCard key={acc.id} account={{ ...acc, visible: !hiddenIds.has(acc.id) }} allTx={transactions}
                LogoEl={Logo}
                onDelete={() => setConfirmDel(acc.id)}
                onToggleVisible={() => setHiddenIds(prev => { const next = new Set(prev); next.has(acc.id) ? next.delete(acc.id) : next.add(acc.id); return next })}
                onToggleExpand={() => toggleExpand(acc.id)}
                expanded={!!expandedIds[acc.id]}
              />
            )
          })}

          {/* Quick-add tiles for unconnected mobile providers */}
          {availableMobile.length > 0 && mobileAccounts.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {availableMobile.map(p => (
                <button key={p.id} onClick={() => { setSelectedMobile(p.id); openModal('mobile') }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 dark:border-dark-border hover:border-gold hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-all text-left">
                  <p.Logo size={28}/>
                  <div><p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{p.name}</p><p className="text-[10px] text-blue-500">+ Connecter</p></div>
                </button>
              ))}
              {/* Autres mobile money */}
              <button onClick={() => openModal('mobile')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-gray-200 dark:border-dark-border hover:border-gold hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-all text-left">
                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center"><Plus size={14} className="text-gray-400"/></div>
                <div><p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Autres</p><p className="text-[10px] text-gray-400">Mobile wallet</p></div>
              </button>
            </div>
          )}

          {/* First-time "Autres" tile */}
          {availableMobile.length > 0 && mobileAccounts.length === 0 && null}
        </div>

        {/* ── Section Banques ──────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">🏦 Banques africaines</h2>
            <Button size="sm" variant="outline" onClick={() => setBankModal(true)}><Plus size={12}/> Ajouter ma banque</Button>
          </div>

          {bankAccounts.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl p-6 text-center">
              <div className="flex justify-center gap-2 mb-3 flex-wrap">
                {['Ecobank','UBA','BOA','Coris'].map(b => (
                  <div key={b} className="px-3 py-1 bg-gray-100 dark:bg-dark-bg rounded-lg text-xs font-bold text-gray-500">{b}</div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mb-3">Connectez votre banque et importez vos relevés de compte</p>
              <Button size="sm" onClick={() => setBankModal(true)}><Plus size={12}/> Ajouter ma banque</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bankAccounts.map(acc => (
                <div key={acc.id} className="border border-gray-200 dark:border-dark-border rounded-xl p-4 bg-white dark:bg-dark-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                        style={{ background: AFRICAN_BANKS.find(b => b.id === acc.provider)?.color || '#374151' }}>
                        {AFRICAN_BANKS.find(b => b.id === acc.provider)?.abbr || '🏦'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-white">{acc.name}</p>
                        <p className="text-[10px] text-gray-400">Compte bancaire</p>
                      </div>
                    </div>
                    <button onClick={() => removeAccount.mutate(acc.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                  <p className="text-sm font-bold text-gray-800 dark:text-white mb-3">{(acc.balance || 0).toLocaleString('fr-FR')} F</p>
                  {/* Import relevé CSV */}
                  <div className="border border-dashed border-gray-200 dark:border-dark-border rounded-lg p-2">
                    <p className="text-[10px] text-gray-500 mb-1.5">Importer un relevé (.csv)</p>
                    <input type="file" accept=".csv,.txt" onChange={e => setCsvFile(e.target.files?.[0] || null)}
                      className="text-[10px] text-gray-500 w-full mb-2 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-gold/10 file:text-gold-dark"/>
                    <Button size="sm" variant="outline" className="w-full text-[10px] py-1" onClick={() => handleCsvImport(acc)} disabled={csvLoading || !csvFile}>
                      {csvLoading ? <Loader2 size={10} className="animate-spin"/> : <RefreshCw size={10}/>} Importer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Section Plateformes & URLs ───────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">🌐 Plateformes & Autres intégrations</h2>
          </div>

          {/* Stripe / PayPal / Shopify */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Plateformes internationales</p>
              <Button size="sm" variant="outline" onClick={() => openModal('platform')}><Plus size={12}/> Ajouter</Button>
            </div>

            {platformAccounts.filter(a => a.type === 'platform').length === 0 && (
              <div className="border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl p-4 mb-3">
                <div className="flex justify-center gap-2 mb-2">
                  <StripeLogo size={32}/><PayPalLogo size={32}/><ShopifyLogo size={32}/>
                </div>
                <p className="text-xs text-gray-400 text-center mb-2">Connectez Stripe, PayPal, Shopify et autres plateformes</p>
                <div className="flex justify-center">
                  <Button size="sm" onClick={() => openModal('platform')}><Plus size={12}/> Connecter</Button>
                </div>
              </div>
            )}

            {platformAccounts.filter(a => a.type === 'platform').map(acc => {
              const prov = PLATFORM_PROVIDERS.find(p => p.id === acc.provider)
              const Logo = prov ? <prov.Logo size={40}/> : <UrlLogo size={40} name={acc.name}/>
              return (
                <AccountCard key={acc.id} account={{ ...acc, visible: !hiddenIds.has(acc.id) }} allTx={transactions}
                  LogoEl={Logo}
                  onDelete={() => setConfirmDel(acc.id)}
                  onToggleVisible={() => setHiddenIds(prev => { const next = new Set(prev); next.has(acc.id) ? next.delete(acc.id) : next.add(acc.id); return next })}
                  onToggleExpand={() => toggleExpand(acc.id)}
                  expanded={!!expandedIds[acc.id]}
                />
              )
            })}

            {availablePlatform.length > 0 && platformAccounts.filter(a => a.type === 'platform').length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {availablePlatform.map(p => (
                  <button key={p.id} onClick={() => { setSelectedPlatform(p.id); openModal('platform') }}
                    className="flex items-center gap-2 p-2 rounded-xl border border-gray-100 dark:border-dark-border hover:border-gold hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-all text-left">
                    <p.Logo size={24}/>
                    <div><p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">{p.name}</p><p className="text-[10px] text-blue-500">+ Connecter</p></div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stripe */}
          {[
            { key: 'stripe', name: 'Stripe', color: '#635BFF', label: 'Stripe (paiements internationaux)', initials: 'ST' },
            { key: 'paypal', name: 'PayPal', color: '#003087', label: 'PayPal', initials: 'PP' },
            { key: 'shopify', name: 'Shopify', color: '#95BF47', label: 'Shopify (e-commerce)', initials: 'SH' },
            { key: 'maketou', name: 'Maketou', color: '#FF6B35', label: 'Maketou (Afrique francophone)', initials: 'MK' },
          ].map(p => (
            <div key={p.key} className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
                  <ShoppingBag size={12} style={{ color: p.color }} /> {p.label}
                </p>
                {!accounts.find(a => a.name === p.name) && (
                  <Button size="sm" variant="outline" onClick={() => setModal(p.key as ModalMode)}><Plus size={12} /> Connecter</Button>
                )}
              </div>
              {accounts.find(a => a.name === p.name) ? (
                accounts.filter(a => a.name === p.name).map(acc => (
                  <div key={acc.id}>
                    <AccountCard account={{ ...acc, visible: !hiddenIds.has(acc.id) }} allTx={transactions}
                      LogoEl={<div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white" style={{ background: p.color }}>{p.initials}</div>}
                      onDelete={() => setConfirmDel(acc.id)}
                      onToggleVisible={() => setHiddenIds(prev => { const n = new Set(prev); n.has(acc.id) ? n.delete(acc.id) : n.add(acc.id); return n })}
                      onToggleExpand={() => setExpandedIds(prev => ({ ...prev, [acc.id]: !prev[acc.id] }))}
                      expanded={!!expandedIds[acc.id]}
                    />
                    {p.key === 'maketou' && (
                      <div className="mt-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold text-orange-800 dark:text-orange-300">🔄 Synchronisation manuelle</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">Maketou ne supporte pas encore les webhooks. Clique pour importer les nouvelles ventes.</p>
                        </div>
                        <Button size="sm" onClick={() => handleSyncMaketou(acc)} disabled={maketouSyncLoading}>
                          {maketouSyncLoading ? <Loader2 size={13} className="animate-spin" /> : '🔄 Sync'}
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white mx-auto mb-2" style={{ background: p.color }}>{p.initials}</div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Connectez {p.name}</p>
                  <Button size="sm" onClick={() => setModal(p.key as ModalMode)}><Key size={12} /> Connecter</Button>
                </div>
              )}
            </div>
          ))}

          {/* Chariow */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
                <ShoppingBag size={12} className="text-gold" /> Chariow (e-commerce Afrique)
              </p>
              {!accounts.find(a => a.name === 'Chariow') && (
                <Button size="sm" variant="outline" onClick={() => setModal('chariow')}><Plus size={12}/> Connecter</Button>
              )}
            </div>
            {accounts.find(a => a.name === 'Chariow') ? (
              accounts.filter(a => a.name === 'Chariow').map(acc => (
                <div key={acc.id}>
                  <AccountCard account={{ ...acc, visible: !hiddenIds.has(acc.id) }} allTx={transactions}
                    LogoEl={<div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center font-bold text-sm text-white">CH</div>}
                    onDelete={() => setConfirmDel(acc.id)}
                    onToggleVisible={() => setHiddenIds(p => { const n = new Set(p); n.has(acc.id) ? n.delete(acc.id) : n.add(acc.id); return n })}
                    onToggleExpand={() => setExpandedIds(p => ({ ...p, [acc.id]: !p[acc.id] }))}
                    expanded={!!expandedIds[acc.id]}
                  />
                  {user?.id && (
                    <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3">
                      <p className="text-[11px] font-semibold text-yellow-800 dark:text-yellow-300 mb-1">⚡ URL Webhook (Pulse) — pour recevoir les ventes en temps réel</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">Colle cette URL dans <strong>Chariow → Automation → Pulses → Add Pulse</strong></p>
                      <div className="flex items-center gap-2 bg-white dark:bg-dark-card rounded-lg px-3 py-2 border border-yellow-200 dark:border-yellow-800/40">
                        <code className="text-[10px] text-gray-700 dark:text-gray-300 flex-1 break-all">
                          {`${window.location.origin}/api/webhooks/chariow/${user.id}`}
                        </code>
                        <button
                          onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/chariow/${user.id}`); toast.success('URL copiée !') }}
                          className="text-[10px] text-yellow-600 font-semibold hover:text-yellow-700 flex-shrink-0">
                          Copier
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="border-2 border-dashed border-yellow-200 dark:border-yellow-800/40 rounded-xl p-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center font-bold text-sm text-white mx-auto mb-2">CH</div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Connectez votre boutique Chariow</p>
                <p className="text-[11px] text-gray-400 mb-3">Importez automatiquement vos commandes et revenus depuis Chariow</p>
                <Button size="sm" onClick={() => setModal('chariow')}><Key size={12}/> Entrer ma clé API</Button>
              </div>
            )}
          </div>

          {/* URL / custom integrations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5"><Link2 size={12}/> Intégrations par URL (Chariow, Maketou, Shopify, etc.)</p>
              <Button size="sm" variant="outline" onClick={() => openModal('url')}><Plus size={12}/> Ajouter URL</Button>
            </div>

            {platformAccounts.filter(a => a.type === 'custom').length === 0 && (
              <div className="border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl p-4 text-center">
                <Globe size={22} className="text-gray-300 mx-auto mb-2"/>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Connectez n'importe quelle plateforme</p>
                <p className="text-[11px] text-gray-400 mb-3">Chariow, Maketou, WooCommerce, votre boutique…<br/>FinTrack trackera automatiquement vos transactions via webhook.</p>
                <Button size="sm" onClick={() => openModal('url')}><Plus size={12}/> Ajouter une URL</Button>
              </div>
            )}

            {platformAccounts.filter(a => a.type === 'custom').map(acc => (
              <AccountCard key={acc.id} account={{ ...acc, visible: !hiddenIds.has(acc.id) }} allTx={transactions}
                LogoEl={<UrlLogo size={40} name={acc.name}/>}
                onDelete={() => setConfirmDel(acc.id)}
                onToggleVisible={() => setHiddenIds(prev => { const next = new Set(prev); next.has(acc.id) ? next.delete(acc.id) : next.add(acc.id); return next })}
                onToggleExpand={() => toggleExpand(acc.id)}
                expanded={!!expandedIds[acc.id]}
              />
            ))}

            {platformAccounts.filter(a => a.type === 'custom').length > 0 && (
              <button onClick={() => openModal('url')}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-dark-border hover:border-gold hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors text-xs text-gray-400 mt-2">
                <Plus size={13}/> Ajouter une autre URL
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}

      {/* Banque */}
      <Modal isOpen={bankModal} onClose={() => setBankModal(false)} title="Ajouter ma banque">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Choisissez votre banque</label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {AFRICAN_BANKS.map(b => (
                <button key={b.id} onClick={() => setBankName(b.id)}
                  className={cn('flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all', bankName === b.id ? 'border-gold bg-gold/5' : 'border-gray-200 dark:border-dark-border hover:border-gold/50')}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0"
                    style={{ background: b.color }}>
                    {b.abbr}
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">{b.name}</span>
                </button>
              ))}
            </div>
          </div>

          {bankName === 'other' && (
            <Input label="Nom de la banque" placeholder="Ex: Ma banque locale" value={bankCustomName} onChange={e => setBankCustomName(e.target.value)}/>
          )}

          <Input label="Solde actuel (optionnel)" type="number" placeholder="Ex: 250000" value={bankBalance} onChange={e => setBankBalance(e.target.value)}/>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
            💡 Après avoir ajouté votre banque, vous pourrez importer votre relevé de compte au format CSV depuis votre espace en ligne.
          </div>

          <Button className="w-full" onClick={handleAddBank} disabled={bankLoading || !bankName}>
            {bankLoading ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>} Ajouter la banque
          </Button>
        </div>
      </Modal>

      {/* Mobile Money */}
      <Modal isOpen={modal === 'mobile'} onClose={closeModal} title="Connecter Mobile Money / Wallet">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Choisissez votre service</label>
            <div className="grid grid-cols-2 gap-2 mb-1">
              {MOBILE_MONEY_PROVIDERS.filter(p => !connectedProviders.includes(p.id as any)).map(p => (
                <button key={p.id} onClick={() => setSelectedMobile(p.id)}
                  className={cn('flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left', selectedMobile === p.id ? 'border-gold bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-100 dark:border-dark-border hover:border-gold')}>
                  <p.Logo size={30}/>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{p.name}</span>
                </button>
              ))}
              {/* Autres */}
              <button onClick={() => setSelectedMobile('__other__')}
                className={cn('flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left', selectedMobile === '__other__' ? 'border-gold bg-yellow-50 dark:bg-yellow-900/20' : 'border-dashed border-gray-200 dark:border-dark-border hover:border-gold')}>
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center text-gray-400 text-lg">+</div>
                <div><p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Autres</p><p className="text-[10px] text-gray-400">Autre wallet mobile</p></div>
              </button>
            </div>
          </div>

          {selectedMobile && (
            <>
              {selectedMobile === '__other__' ? (
                <Input label="Nom du wallet" placeholder="Ex: CeltisPay, FreeMo..." value={mobilePhone} onChange={e => setMobilePhone(e.target.value)}/>
              ) : (
                <Input label="Numéro de téléphone" placeholder={MOBILE_MONEY_PROVIDERS.find(p => p.id === selectedMobile)?.placeholder || ''} value={mobilePhone} onChange={e => setMobilePhone(e.target.value)}/>
              )}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                💡 FinTrack importera vos transactions récentes et détectera chaque nouveau mouvement automatiquement via webhook.
              </div>
            </>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={closeModal}>Annuler</Button>
            <Button className="flex-1" onClick={handleConnectMobile} disabled={!selectedMobile}>Connecter</Button>
          </div>
        </div>
      </Modal>

      {/* Plateformes internationales */}
      <Modal isOpen={modal === 'platform'} onClose={closeModal} title="Connecter une plateforme internationale">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Choisissez la plateforme</label>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORM_PROVIDERS.filter(p => !connectedProviders.includes(p.id as any)).map(p => (
                <button key={p.id} onClick={() => setSelectedPlatform(p.id)}
                  className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all', selectedPlatform === p.id ? 'border-gold bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-100 dark:border-dark-border hover:border-gold')}>
                  <p.Logo size={32}/>
                  <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
          {selectedPlatform && (
            <>
              <Input
                label={PLATFORM_PROVIDERS.find(p => p.id === selectedPlatform)?.field === 'url' ? 'URL de l\'API' : 'Clé API / Token'}
                placeholder={PLATFORM_PROVIDERS.find(p => p.id === selectedPlatform)?.placeholder || ''}
                value={platformKey}
                onChange={e => setPlatformKey(e.target.value)}
              />
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-[11px] text-gray-500 dark:text-gray-400">
                💡 Vos revenus et paiements seront automatiquement trackés et ajoutés à votre tableau de bord FinTrack.
              </div>
            </>
          )}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={closeModal}>Annuler</Button>
            <Button className="flex-1" onClick={handleConnectPlatform} disabled={!selectedPlatform}>Connecter</Button>
          </div>
        </div>
      </Modal>

      {/* Stripe */}
      <Modal isOpen={modal === 'stripe'} onClose={() => { setModal(null); setStripeKey('') }} title="Connecter Stripe" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0" style={{ background: '#635BFF' }}>ST</div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">Stripe</p>
              <p className="text-[11px] text-gray-400">Importez vos paiements Stripe automatiquement</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Trouvez votre clé dans <strong>Stripe → Développeurs → Clés API → Clé secrète</strong></p>
          <Input label="Clé secrète Stripe" placeholder="sk_live_xxxxxxxxxxxxx" value={stripeKey} onChange={e => setStripeKey(e.target.value)} type="password" />
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-[11px] text-gray-500 dark:text-gray-400">🔒 Votre clé est stockée de façon sécurisée.</div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { setModal(null); setStripeKey('') }}>Annuler</Button>
            <Button className="flex-1" disabled={stripeLoading} onClick={() => handleConnectApiPlatform('stripe', 'stripe', { apiKey: stripeKey.trim() }, 'Stripe', 'USD', setStripeLoading, () => setStripeKey(''))}>
              {stripeLoading ? <Loader2 size={15} className="animate-spin" /> : 'Connecter'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* PayPal */}
      <Modal isOpen={modal === 'paypal'} onClose={() => { setModal(null); setPaypalClientId(''); setPaypalSecret('') }} title="Connecter PayPal" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0" style={{ background: '#003087' }}>PP</div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">PayPal</p>
              <p className="text-[11px] text-gray-400">Importez vos transactions PayPal</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Trouvez vos identifiants dans <strong>PayPal Developer → My Apps & Credentials</strong></p>
          <Input label="Client ID" placeholder="AXxxxxxxxxxxxxxxxxxx" value={paypalClientId} onChange={e => setPaypalClientId(e.target.value)} />
          <Input label="Client Secret" placeholder="EKxxxxxxxxxxxxxxxxxx" value={paypalSecret} onChange={e => setPaypalSecret(e.target.value)} type="password" />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { setModal(null); setPaypalClientId(''); setPaypalSecret('') }}>Annuler</Button>
            <Button className="flex-1" disabled={paypalLoading} onClick={() => handleConnectApiPlatform('paypal', 'paypal', { clientId: paypalClientId.trim(), clientSecret: paypalSecret.trim() }, 'PayPal', 'USD', setPaypalLoading, () => { setPaypalClientId(''); setPaypalSecret('') })}>
              {paypalLoading ? <Loader2 size={15} className="animate-spin" /> : 'Connecter'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Shopify */}
      <Modal isOpen={modal === 'shopify'} onClose={() => { setModal(null); setShopifyDomain(''); setShopifyToken('') }} title="Connecter Shopify" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0" style={{ background: '#95BF47' }}>SH</div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">Shopify</p>
              <p className="text-[11px] text-gray-400">Importez vos commandes Shopify</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Trouvez le token dans <strong>Shopify → Apps → Develop Apps → Admin API access token</strong></p>
          <Input label="Domaine boutique" placeholder="ma-boutique.myshopify.com" value={shopifyDomain} onChange={e => setShopifyDomain(e.target.value)} />
          <Input label="Access Token" placeholder="shpat_xxxxxxxxxxxxx" value={shopifyToken} onChange={e => setShopifyToken(e.target.value)} type="password" />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { setModal(null); setShopifyDomain(''); setShopifyToken('') }}>Annuler</Button>
            <Button className="flex-1" disabled={shopifyLoading} onClick={() => handleConnectApiPlatform('shopify', 'shopify', { shopDomain: shopifyDomain.trim(), accessToken: shopifyToken.trim() }, 'Shopify', 'USD', setShopifyLoading, () => { setShopifyDomain(''); setShopifyToken('') })}>
              {shopifyLoading ? <Loader2 size={15} className="animate-spin" /> : 'Connecter'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Maketou */}
      <Modal isOpen={modal === 'maketou'} onClose={() => { setModal(null); setMaketouKey('') }} title="Connecter Maketou" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0" style={{ background: '#FF6B35' }}>MK</div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">Maketou</p>
              <p className="text-[11px] text-gray-400">Importez vos ventes de produits numériques</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Trouvez votre clé dans <strong>Maketou → Paramètres → API</strong></p>
          <Input label="Clé API Maketou" placeholder="mk_xxxxxxxxxxxxx" value={maketouKey} onChange={e => setMaketouKey(e.target.value)} type="password" />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { setModal(null); setMaketouKey('') }}>Annuler</Button>
            <Button className="flex-1" disabled={maketouLoading} onClick={() => handleConnectApiPlatform('maketou', 'maketou', { apiKey: maketouKey.trim() }, 'Maketou', 'XOF', setMaketouLoading, () => setMaketouKey(''))}>
              {maketouLoading ? <Loader2 size={15} className="animate-spin" /> : 'Connecter'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Chariow */}
      <Modal isOpen={modal === 'chariow'} onClose={() => { setModal(null); setChariowKey('') }} title="Connecter Chariow" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">CH</div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">Chariow</p>
              <p className="text-[11px] text-gray-400">Importez vos commandes et revenus automatiquement</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Trouvez votre clé API dans votre dashboard Chariow → <strong>Développeurs → API</strong>
            </p>
            <Input
              label="Clé API Chariow"
              placeholder="sk_xxxxx_xxxxxxxxxxxxxxxx"
              value={chariowKey}
              onChange={e => setChariowKey(e.target.value)}
              type="password"
            />
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-[11px] text-gray-500 dark:text-gray-400">
            🔒 Votre clé est stockée de façon sécurisée et ne sera jamais partagée.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { setModal(null); setChariowKey('') }}>Annuler</Button>
            <Button className="flex-1" onClick={handleConnectChariow} disabled={chariowLoading}>
              {chariowLoading ? <Loader2 size={15} className="animate-spin" /> : 'Connecter'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* URL / Custom */}
      <Modal isOpen={modal === 'url'} onClose={closeModal} title="Intégration par URL" size="md">
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
            <strong className="text-blue-600">Comment ça marche :</strong> Renseignez l'URL webhook ou API de votre plateforme (Chariow, Maketou, Shopify, WooCommerce, etc.). FinTrack se connecte à l'API et importe automatiquement vos transactions.
          </div>

          <div className="space-y-3">
            {urlEntries.map((entry, i) => (
              <div key={i} className="border border-gray-100 dark:border-dark-border rounded-xl p-3 relative">
                {urlEntries.length > 1 && (
                  <button onClick={() => removeUrlEntry(i)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={13}/>
                  </button>
                )}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Input label="Nom de la plateforme" placeholder="Ex: Ma boutique Chariow" value={entry.name} onChange={e => updateUrlEntry(i, 'name', e.target.value)}/>
                  <Input label="URL de l'API / Webhook" placeholder="https://api.chariow.com/..." value={entry.url} onChange={e => updateUrlEntry(i, 'url', e.target.value)}/>
                </div>
                <Input label="Token / Clé API (optionnel)" placeholder="Bearer token ou clé secrète..." value={entry.token} onChange={e => updateUrlEntry(i, 'token', e.target.value)}/>
              </div>
            ))}
          </div>

          <button onClick={addUrlEntry}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-dark-border hover:border-gold hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors text-xs text-gray-400">
            <Plus size={13}/> Ajouter une autre plateforme
          </button>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={closeModal}>Annuler</Button>
            <Button className="flex-1" onClick={handleConnectUrls}>Connecter ({urlEntries.filter(e => e.name && e.url).length} plateforme{urlEntries.filter(e => e.name && e.url).length > 1 ? 's' : ''})</Button>
          </div>
        </div>
      </Modal>

      {/* Confirm delete */}
      <Modal isOpen={!!confirmDel} onClose={() => setConfirmDel(null)} title="Déconnecter ?" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Les transactions déjà importées seront conservées. La synchronisation s'arrêtera.</p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmDel(null)}>Annuler</Button>
          <Button variant="danger" className="flex-1" onClick={() => confirmDel && handleDelete(confirmDel)}>Déconnecter</Button>
        </div>
      </Modal>
    </AppLayout>
  )
}
