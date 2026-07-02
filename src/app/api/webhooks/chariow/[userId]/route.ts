import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Réponse toujours 200 avec les bons headers pour que Chariow ne désactive pas le Pulse
function ok(data: object = {}) {
  return NextResponse.json({ received: true, ...data }, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Chariow-Signature',
    },
  })
}

// Chariow peut envoyer un GET ou OPTIONS pour vérifier l'endpoint avant de l'activer
export async function GET() {
  return ok({ status: 'webhook_active' })
}
export async function OPTIONS() {
  return ok({ status: 'ok' })
}

// Événements qui indiquent un VIREMENT (argent net réellement reçu sur le compte bancaire)
const PAYOUT_EVENTS = new Set([
  'payout', 'payout.completed', 'payout.paid', 'payout.success',
  'withdrawal', 'withdrawal.completed', 'settlement', 'settlement.paid',
  'transfer.completed', 'transfer.paid',
])

// Événements de vente — on met à jour le solde seulement, pas de transaction
const SALE_EVENTS = new Set([
  'successful.sale', 'sale.completed', 'sale.success', 'sale.paid',
  'order.completed', 'order.paid', 'payment.success', 'payment.completed',
])

function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
}

async function getChariowAccount(supabase: any, userId: string) {
  const { data } = await supabase
    .from('accounts')
    .select('id, balance')
    .eq('user_id', userId)
    .eq('name', 'Chariow')
    .single()
  return data as { id: string; balance: number } | null
}

// Extraire le solde disponible depuis le payload Chariow
function extractBalance(body: any): number | null {
  const candidates = [
    body.store?.balance?.value,
    body.store?.available_balance?.value,
    body.balance?.value,
    body.available_balance?.value,
    body.wallet?.balance?.value,
    body.account?.balance?.value,
    body.store?.balance,
    body.balance,
  ]
  for (const v of candidates) {
    const n = Number(v)
    if (!isNaN(n) && n >= 0) return n
  }
  return null
}

// Extraire le montant net d'un payout
function extractPayoutAmount(body: any): { amount: number; currency: string } {
  const payout = body.payout || body.withdrawal || body.settlement || body.transfer || body
  const amount = Math.max(0, Number(
    payout.net_amount?.value ?? payout.amount?.value ?? payout.net_amount ?? payout.amount ?? 0
  ))
  const currency = (
    payout.net_amount?.currency || payout.amount?.currency || payout.currency || 'XOF'
  ).toUpperCase()
  return { amount, currency }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params
  if (!userId) return ok({ error: 'userId manquant' })

  let body: any = {}
  try {
    const text = await req.text()
    if (text) body = JSON.parse(text)
  } catch {
    // payload non-JSON → on accepte quand même
    return ok({ note: 'payload_ignored_non_json' })
  }

  const eventName: string = (body.event || body.type || body.action || '').toLowerCase()

  // Logger le payload brut pour debug (utile pour identifier la structure exacte de Chariow)
  console.log(`[Chariow Webhook] userId=${userId} event="${eventName}" payload=`, JSON.stringify(body).slice(0, 500))

  // Traitement asynchrone — répondre 200 TOUT DE SUITE
  processEvent(userId, eventName, body).catch(e =>
    console.error(`[Chariow Webhook] Erreur async userId=${userId}:`, e?.message)
  )

  return ok({ event: eventName || 'unknown' })
}

async function processEvent(userId: string, eventName: string, body: any) {
  const supabase = getSupabaseAdmin()
  const account = await getChariowAccount(supabase, userId)

  if (PAYOUT_EVENTS.has(eventName)) {
    // Virement reçu → enregistrer la transaction nette + mettre à jour le solde
    const { amount, currency } = extractPayoutAmount(body)

    if (amount > 0) {
      const payout = body.payout || body.withdrawal || body.settlement || body.transfer || body
      const date = (payout.paid_at || payout.completed_at || payout.created_at || new Date().toISOString()).split('T')[0]

      await supabase.from('transactions').insert({
        user_id: userId,
        account_id: account?.id ?? null,
        type: 'income',
        amount,
        currency: (['XOF','EUR','USD','GBP','CAD','MAD','TND','NGN','KES','GHS','XAF'].includes(currency) ? currency : 'XOF'),
        category: 'freelance',
        description: `Chariow — Virement net reçu`,
        date,
        is_recurring: false,
        coffre_id: null,
      })

      console.log(`[Chariow Webhook] Virement enregistré: ${amount} ${currency} pour userId=${userId}`)
    }

    // Mettre à jour le solde si disponible dans le payload
    const newBalance = extractBalance(body)
    if (account) {
      await supabase.from('accounts').update({
        balance: newBalance !== null ? newBalance : ((account.balance || 0) + (amount > 0 ? amount : 0)),
        last_sync: new Date().toISOString(),
      }).eq('id', account.id)
    }

  } else if (SALE_EVENTS.has(eventName)) {
    // Vente → seulement mettre à jour le solde disponible (pas de transaction)
    const newBalance = extractBalance(body)
    if (account && newBalance !== null) {
      await supabase.from('accounts').update({
        balance: newBalance,
        last_sync: new Date().toISOString(),
      }).eq('id', account.id)
      console.log(`[Chariow Webhook] Solde mis à jour: ${newBalance} pour userId=${userId}`)
    } else {
      console.log(`[Chariow Webhook] Vente reçue, solde non disponible dans le payload — sync manuelle recommandée`)
    }

  } else {
    // Événement inconnu → on essaie quand même de mettre à jour le solde si présent
    const newBalance = extractBalance(body)
    if (account && newBalance !== null) {
      await supabase.from('accounts').update({
        balance: newBalance,
        last_sync: new Date().toISOString(),
      }).eq('id', account.id)
    }
    console.log(`[Chariow Webhook] Événement inconnu "${eventName}" — solde=${newBalance ?? 'absent'}`)
  }
}
