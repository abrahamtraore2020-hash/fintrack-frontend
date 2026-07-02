import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const CHARIOW_BASE = 'https://api.chariow.com/v1'

function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
}

// Tente plusieurs endpoints pour trouver le solde du compte
async function fetchBalance(headers: HeadersInit): Promise<{ balance: number; currency: string; raw: any }> {
  // Endpoints possibles pour le solde/wallet
  const balanceEndpoints = [
    '/store',
    '/wallet',
    '/balance',
    '/account',
    '/seller',
    '/earnings',
  ]

  for (const ep of balanceEndpoints) {
    try {
      const res = await fetch(`${CHARIOW_BASE}${ep}`, { headers })
      if (!res.ok) continue
      const data = await res.json()
      const d = data.data || data

      // Chercher le solde dans plusieurs champs possibles
      const candidates = [
        d.balance?.value, d.available_balance?.value, d.wallet?.balance?.value,
        d.earnings?.available?.value, d.net_balance?.value, d.store?.balance?.value,
        d.balance, d.available_balance,
      ]
      for (const v of candidates) {
        const n = Number(v)
        if (!isNaN(n) && n >= 0) {
          const currency = (
            d.balance?.currency || d.available_balance?.currency ||
            d.currency || d.store?.currency || 'XOF'
          ).toUpperCase()
          return { balance: n, currency, raw: d }
        }
      }
    } catch { continue }
  }

  return { balance: 0, currency: 'XOF', raw: null }
}

// Tente plusieurs endpoints pour trouver les virements (payouts)
async function fetchPayouts(headers: HeadersInit): Promise<any[]> {
  const payoutEndpoints = ['/payouts', '/withdrawals', '/settlements', '/transfers', '/disbursements']

  for (const ep of payoutEndpoints) {
    try {
      const res = await fetch(`${CHARIOW_BASE}${ep}?per_page=50&status=completed`, { headers })
      if (!res.ok) continue
      const data = await res.json()
      const items = data.data?.data || data.data || data.payouts || data.withdrawals || data.items || []
      if (Array.isArray(items) && items.length >= 0) return items
    } catch { continue }
  }

  return []
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { apiKey, userId } = body

    if (!apiKey) return NextResponse.json({ error: 'Clé API manquante' }, { status: 400 })

    const headers: HeadersInit = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    // 1. Valider la clé via /store
    const storeRes = await fetch(`${CHARIOW_BASE}/store`, { headers })
    if (!storeRes.ok) {
      return NextResponse.json({
        error: 'Clé API invalide ou expirée. Vérifiez dans Chariow → Développeurs → API',
      }, { status: 401 })
    }
    const storeData = await storeRes.json()
    const store = storeData.data || storeData

    // 2. Récupérer le solde disponible (argent après frais Chariow)
    const { balance, currency, raw: balanceRaw } = await fetchBalance(headers)

    // 3. Récupérer les virements reçus (argent net réellement versé)
    const payouts = await fetchPayouts(headers)

    // Construire les transactions à partir des virements uniquement (argent net reçu)
    const transactions = payouts.map((p: any) => {
      const amount = Math.max(0, Number(
        p.net_amount?.value ?? p.amount?.value ?? p.net_amount ?? p.amount ?? 0
      ))
      const cur = (p.net_amount?.currency || p.amount?.currency || p.currency || currency).toUpperCase()
      const date = (p.paid_at || p.completed_at || p.created_at || new Date().toISOString()).split('T')[0]
      return {
        type: 'income' as const,
        amount,
        currency: (['XOF','EUR','USD','GBP','CAD','MAD','TND','NGN','KES','GHS','XAF'].includes(cur) ? cur : 'XOF') as any,
        category: 'freelance' as const,
        description: `Chariow — Virement net reçu`,
        date,
        isRecurring: false,
      }
    }).filter((t: any) => t.amount > 0)

    // 4. Si userId fourni, mettre à jour le solde du compte Chariow en base
    if (userId) {
      const supabase = getSupabaseAdmin()
      const { data: account } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', userId)
        .eq('name', 'Chariow')
        .single()

      if (account) {
        await supabase.from('accounts').update({
          balance,
          last_sync: new Date().toISOString(),
        }).eq('id', account.id)
      }
    }

    return NextResponse.json({
      success: true,
      // Solde actuel du compte Chariow (après frais)
      balance,
      currency,
      store_name: store.name || store.store_name || 'Ma boutique Chariow',
      // Virements reçus = transactions à importer dans FunTrack
      transactions,
      total_payouts: transactions.length,
      total_net_received: transactions.reduce((s: number, t: any) => s + t.amount, 0),
      // Debug pour identifier la structure exacte
      _debug: {
        balance_raw: balanceRaw ? JSON.stringify(balanceRaw).slice(0, 300) : null,
        payout_count: payouts.length,
        first_payout: payouts[0] ? JSON.stringify(payouts[0]).slice(0, 300) : null,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 })
  }
}
