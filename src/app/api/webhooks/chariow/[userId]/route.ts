import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  // Créer le client admin ici (lazy) pour éviter l'erreur au build si la clé manque
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

  try {
    const { userId } = params
    if (!userId) return NextResponse.json({ error: 'userId manquant' }, { status: 400 })

    const body = await req.json()

    // Vérifier que c'est bien un événement de vente réussie
    if (body.event !== 'successful.sale') {
      return NextResponse.json({ received: true, skipped: true })
    }

    const sale = body.sale || {}
    const product = body.product || {}

    // Extraire le montant
    const amount = Math.max(0,
      Number(sale.amount?.value ?? sale.settlement?.amount?.value ?? sale.payment?.amount?.value ?? 0)
    )
    const currency = (sale.amount?.currency || 'XOF').toUpperCase()
    const date = (sale.completed_at || sale.created_at || new Date().toISOString()).split('T')[0]
    const description = `Chariow – ${product.name || 'Vente #' + sale.id}`

    // Trouver le compte Chariow de cet utilisateur
    const { data: account } = await supabaseAdmin
      .from('accounts')
      .select('id, balance')
      .eq('user_id', userId)
      .eq('name', 'Chariow')
      .single()

    // Insérer la transaction
    const { error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: userId,
        account_id: account?.id ?? null,
        type: 'income',
        amount,
        currency: currency === 'XOF' ? 'XOF' : currency === 'EUR' ? 'EUR' : 'USD',
        category: 'freelance',
        description,
        date,
        is_recurring: false,
        coffre_id: null,
      })

    if (txError) {
      console.error('Webhook Chariow — erreur insert transaction:', txError)
      return NextResponse.json({ error: txError.message }, { status: 500 })
    }

    // Mettre à jour le solde du compte
    if (account) {
      await supabaseAdmin
        .from('accounts')
        .update({ balance: (account.balance || 0) + amount, last_sync: new Date().toISOString() })
        .eq('id', account.id)
    }

    return NextResponse.json({ received: true, amount, description })
  } catch (e: any) {
    console.error('Webhook Chariow error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
